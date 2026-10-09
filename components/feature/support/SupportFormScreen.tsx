import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import {
	Form,
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { CheckCircleIcon, EFeather } from "@/components/icons";
import { Radio, RadioGroup } from "@/components/ui/radio";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type SupportFormValues, supportFormSchema } from "@/schema/support";
import type { SupportFormMode } from "@/types/ui/support";
import SupportAttachmentInput from "./SupportAttachmentInput";
import SupportHero from "./SupportHero";

const FEEDBACK_TYPES: {
	value: SupportFormValues["feedbackType"];
	label: string;
	icon: "smile" | "frown" | "alert-triangle" | "heart";
	iconClassName: string;
}[] = [
	{
		value: "suggestion",
		label: "Saran",
		icon: "smile",
		iconClassName: "text-primary",
	},
	{
		value: "criticism",
		label: "Kritik",
		icon: "frown",
		iconClassName: "text-warning",
	},
	{
		value: "problem",
		label: "Masalah",
		icon: "alert-triangle",
		iconClassName: "text-destructive",
	},
	{
		value: "appreciation",
		label: "Apresiasi",
		icon: "heart",
		iconClassName: "text-success",
	},
];

const REQUEST_CHECKLIST = [
	"Ide atau fitur belum tersedia di aplikasi",
	"Deskripsi jelas dan mudah dipahami",
	"Permintaan sesuai dengan kebutuhan bisnis",
];

export default function SupportFormScreen({ mode }: { mode: SupportFormMode }) {
	return <SupportFormEditor key={mode} mode={mode} />;
}

function SupportFormEditor({ mode }: { mode: SupportFormMode }) {
	const isFeedback = mode === "feedback";
	const unavailableModal = useAlertModal();
	const mounted = useRef(true);
	const form = useForm<SupportFormValues>({
		resolver: zodResolver(supportFormSchema),
		defaultValues: {
			title: "",
			description: "",
			feedbackType: "suggestion",
			relatedPage: "",
			attachment: null,
		},
	});

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	// The legacy feature-request API accepts contact details and a description,
	// but has no contract for this form's title/attachment or for feedback.
	// Preserve the form until the matching submission contract is available.
	function onSubmit(_values: SupportFormValues) {
		if (mounted.current) unavailableModal.open();
	}

	return (
		<>
			<Wrapper
				hasActionButton
				contentContainerStyle={{ padding: 16, gap: isFeedback ? 24 : 16 }}
			>
				<SupportHero mode={mode} />
				<Card density="compact" className={isFeedback ? "gap-3" : "gap-4"}>
					<View className="flex-row items-center gap-2">
						<View className="size-10 items-center justify-center rounded-lg bg-primary/10">
							<EFeather name="file-text" size={24} className="text-primary" />
						</View>
						<View className="flex-1 gap-1">
							<Text size="normal" w="medium">
								Detail Permintaan
							</Text>
							<Text size="small" className="leading-4 text-muted">
								Lengkapi informasi dasar pengajuan fitur Anda
							</Text>
						</View>
					</View>
					<View className="h-px bg-border-muted" />
					<Form {...form}>
						<View className={isFeedback ? "gap-3" : "gap-4"}>
							{isFeedback && (
								<>
									<FormField
										control={form.control}
										name="feedbackType"
										render={({ field }) => (
											<FormItem>
												<FormLabel required size="body">
													Jenis Feedback
												</FormLabel>
												<FormControl>
													<RadioGroup
														value={field.value}
														onChange={field.onChange}
														accessibilityLabel="Jenis Feedback"
													>
														<ScrollView
															horizontal
															style={{ flexGrow: 0, flexShrink: 0 }}
															showsHorizontalScrollIndicator={false}
															contentContainerStyle={{ gap: 8 }}
														>
															{FEEDBACK_TYPES.map((type) => (
																<Radio
																	key={type.value}
																	value={type.value}
																	accessibilityLabel={type.label}
																	className={cn(
																		"gap-2 rounded-lg border px-3 py-2",
																		field.value === type.value
																			? "border-primary bg-primary/10"
																			: "border-border-muted bg-surface",
																	)}
																>
																	<EFeather
																		name={type.icon}
																		size={16}
																		className={type.iconClassName}
																	/>
																	<Text
																		size="small"
																		w="medium"
																		className={
																			field.value === type.value
																				? "text-primary"
																				: "text-foreground"
																		}
																	>
																		{type.label}
																	</Text>
																</Radio>
															))}
														</ScrollView>
													</RadioGroup>
												</FormControl>
												<FormMessage size="small" />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="relatedPage"
										render={({ field, fieldState }) => (
											<FormItem>
												<FormLabel size="body">
													Fitur / halaman terkait
												</FormLabel>
												<FormControl>
													<Textarea
														variant="outline"
														size="md"
														height="tall"
														isInvalid={!!fieldState.error}
													>
														<TextareaInput
															placeholder="Fitur tambah pesanan"
															aria-label="Fitur atau halaman terkait"
															value={field.value}
															onChangeText={field.onChange}
															onBlur={field.onBlur}
															multiline
															textAlignVertical="top"
															maxLength={500}
														/>
													</Textarea>
												</FormControl>
												<FormMessage size="small" />
											</FormItem>
										)}
									/>
								</>
							)}
							<FormField
								control={form.control}
								name="title"
								render={() => (
									<FormItem>
										<FormLabel required size="body">
											{isFeedback ? "Judul" : "Judul Permintaan"}
										</FormLabel>
										<FormControl>
											<FormInput
												placeholder={
													isFeedback
														? "Contoh: tampilan laporan sulit"
														: "Contoh: pengingat stok otomatis"
												}
												fieldProps={{
													maxLength: 150,
													"aria-label": isFeedback
														? "Judul feedback"
														: "Judul permintaan",
												}}
											/>
										</FormControl>
										<FormMessage size="small" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field, fieldState }) => (
									<FormItem>
										<FormLabel required size="body">
											{isFeedback ? "Feedback" : "Deskripsi"}
										</FormLabel>
										<FormControl>
											<Textarea
												variant="outline"
												size="md"
												height={isFeedback ? "tall" : "short"}
												isInvalid={!!fieldState.error}
											>
												<TextareaInput
													placeholder={
														isFeedback
															? "Tuliskan feedback Anda secara detail"
															: "Jelaskan ide dan kebutuhan fitur Anda"
													}
													aria-label={
														isFeedback ? "Isi feedback" : "Deskripsi permintaan"
													}
													value={field.value}
													onChangeText={field.onChange}
													onBlur={field.onBlur}
													multiline
													textAlignVertical="top"
													maxLength={5000}
												/>
											</Textarea>
										</FormControl>
										<FormMessage size="small" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="attachment"
								render={({ field }) => (
									<FormItem>
										<FormLabel size="body">Lampiran</FormLabel>
										<FormControl>
											<SupportAttachmentInput
												value={field.value}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage size="small" />
									</FormItem>
								)}
							/>
						</View>
					</Form>
				</Card>
				{!isFeedback && (
					<View className="gap-3 rounded-xl border border-primary bg-primary/5 p-3">
						<Text size="normal" w="medium">
							Sebelum mengirim, pastikan:
						</Text>
						<View className="gap-2">
							{REQUEST_CHECKLIST.map((item) => (
								<View key={item} className="flex-row items-center gap-2">
									<CheckCircleIcon size={20} className="text-primary" />
									<Text size="small" className="flex-1 text-subtle">
										{item}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}
			</Wrapper>
			<BottomActionButton onPress={() => form.handleSubmit(onSubmit)()}>
				{isFeedback ? "Kirim" : "Ajukan"}
			</BottomActionButton>
			<AlertModal
				openState={unavailableModal.openState}
				title="Pengiriman belum tersedia"
				message={`${isFeedback ? "Feedback Anda belum dikirim." : "Permintaan Anda belum dikirim."} Isi form tetap tersedia selama halaman ini terbuka. Silakan coba kembali setelah layanan pengiriman tersedia.`}
				confirmText="Kembali ke form"
				hideCancelButton
			/>
		</>
	);
}
