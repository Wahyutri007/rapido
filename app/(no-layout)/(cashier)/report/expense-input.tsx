import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import BottomActionButton from "@/components/common/BottomActionButton";
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
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { useAlertModal } from "@/hooks/useAlertModal";

// Local preview shape only; expense submission/financial validation is unavailable.
const expensePreviewSchema = z.object({
	code: z.string(),
	source: z.string(),
	store: z.string(),
	amount: z.string(),
	description: z.string(),
});

export default function ExpenseInputScreen() {
	const unavailableModal = useAlertModal();
	const { height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const form = useForm<z.infer<typeof expensePreviewSchema>>({
		resolver: zodResolver(expensePreviewSchema),
		defaultValues: {
			code: "",
			source: "",
			store: "",
			amount: "",
			description: "",
		},
	});

	return (
		<>
			<Actionsheet
				isOpen={unavailableModal.isOpen}
				onClose={unavailableModal.close}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent
					className="items-stretch"
					style={{ maxHeight: Math.max(0, height - insets.top - 16) }}
				>
					<ActionsheetScrollView
						className="min-h-0"
						contentContainerStyle={{ gap: 16 }}
						keyboardShouldPersistTaps="handled"
					>
						<Text size="body" w="semibold">
							Belum dapat menyimpan pengeluaran
						</Text>
						<Text size="normal" className="text-muted">
							Formulir ini masih pratinjau. Pengeluaran belum dicatat, saldo kas
							tidak berubah, dan isian tidak disimpan.
						</Text>
						<Button onPress={unavailableModal.close}>
							<ButtonText>Tutup</ButtonText>
						</Button>
					</ActionsheetScrollView>
				</ActionsheetContent>
			</Actionsheet>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Text size="small" className="text-muted">
					Pratinjau formulir pengeluaran. Isian hanya berlaku di halaman ini dan
					belum dicatat ke laporan atau saldo kas.
				</Text>
				<View>
					<Form {...form}>
						<View className="gap-6">
							<FormField
								control={form.control}
								name="code"
								render={() => (
									<FormItem>
										<FormLabel>No. Referensi</FormLabel>
										<FormControl>
											<FormInput
												placeholder="CD000001"
												fieldProps={{
													accessibilityLabel: "No. Referensi",
													"aria-label": "No. Referensi",
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="source"
								render={() => (
									<FormItem>
										<FormLabel>Sumber Dana</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Kas"
												fieldProps={{
													accessibilityLabel: "Sumber Dana",
													"aria-label": "Sumber Dana",
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="store"
								render={() => (
									<FormItem>
										<FormLabel>Toko</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Toko belum tersedia"
												isReadOnly
												fieldProps={{
													accessibilityLabel: "Toko",
													"aria-label": "Toko",
													editable: false,
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="amount"
								render={() => (
									<FormItem>
										<FormLabel>Nominal</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Rp 10.000"
												fieldProps={{
													accessibilityLabel: "Nominal",
													"aria-label": "Nominal",
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={() => (
									<FormItem>
										<FormLabel>Deskripsi</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Contoh: Stok Harian"
												multiline
												fieldProps={{
													accessibilityLabel: "Deskripsi",
													"aria-label": "Deskripsi",
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</View>
					</Form>
				</View>
			</Wrapper>

			<BottomActionButton onPress={unavailableModal.open}>
				Simpan
			</BottomActionButton>
		</>
	);
}
