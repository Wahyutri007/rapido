import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
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
	FormSelect,
} from "@/components/common/Form";
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import { route } from "@/lib/utils";
import {
	DIGITAL_CHANNEL_KINDS,
	type DigitalOrderChannelInput,
	type DigitalOrderChannelValues,
	digitalOrderChannelSchema,
} from "@/schema/manage/digital-order-channel";
import { useDigitalOrderChannelStore } from "@/store/digitalOrderChannelStore";
import type { DigitalOrderChannel } from "@/types/ui/manage/digital-order-channel";
import ChannelNotice from "./ChannelNotice";

export default function ChannelModifyScreen({
	item,
}: {
	item?: DigitalOrderChannel;
}) {
	const [initial] = useState(item);
	const form = useForm<
		DigitalOrderChannelInput,
		unknown,
		DigitalOrderChannelValues
	>({
		resolver: zodResolver(digitalOrderChannelSchema),
		defaultValues: {
			name: initial?.name ?? "",
			kind: initial?.kind ?? "link",
			url: initial?.url ?? "",
			notes: initial?.notes ?? "",
		},
	});
	const success = useAlertModal();
	const error = useAlertModal();
	const mounted = useRef(false);
	const submitted = useRef(false);
	const acknowledged = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	function save(values: DigitalOrderChannelValues) {
		if (!mounted.current || submitted.current) return;
		submitted.current = true;
		const store = useDigitalOrderChannelStore.getState();
		const result = initial
			? store.update(initial.id, initial.revision, values)
			: store.add(values);
		if (!result.ok) {
			submitted.current = false;
			if (result.reason === "duplicate")
				form.setError("name", { message: "Nama kanal sudah digunakan" });
			else error.open();
			return;
		}
		success.open();
	}
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<ChannelNotice />
				<Card className="gap-4">
					<Form {...form}>
						<View className="gap-4">
							<FormField
								control={form.control}
								name="name"
								render={() => (
									<FormItem>
										<FormLabel required>Nama Kanal</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Nama kanal pemesanan"
												fieldProps={{ maxLength: 80 }}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="kind"
								render={() => (
									<FormItem>
										<FormLabel required>Jenis Kanal</FormLabel>
										<FormControl>
											<FormSelect
												data={[...DIGITAL_CHANNEL_KINDS]}
												label="Jenis Kanal"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="url"
								render={() => (
									<FormItem>
										<FormLabel required>URL Pemesanan</FormLabel>
										<FormControl>
											<FormInput
												placeholder="https://contoh.com/pesan"
												fieldProps={{
													keyboardType: "url",
													autoCapitalize: "none",
													autoCorrect: false,
													maxLength: 2048,
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="notes"
								render={() => (
									<FormItem>
										<FormLabel>Catatan</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Catatan kanal (opsional)"
												multiline
												fieldProps={{ maxLength: 1000 }}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</View>
					</Form>
				</Card>
			</Wrapper>
			<BottomActionButton
				onPress={() => form.handleSubmit(save)()}
				isDisabled={form.formState.isSubmitting || success.openState[0]}
			>
				Simpan Draf
			</BottomActionButton>
			<SuccessModal
				openState={success.openState}
				title={initial ? "Draf kanal diperbarui" : "Draf kanal ditambahkan"}
				description="Draf tersimpan selama aplikasi terbuka. Kanal belum aktif dan belum menerima pesanan."
				onClose={() => {
					if (!mounted.current || !submitted.current || acknowledged.current)
						return;
					acknowledged.current = true;
					success.close();
					router.dismissTo(route("/manage/pos-settings/digital-orders"));
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Draf belum tersimpan"
				message="Data kanal berubah atau sudah tidak tersedia. Draf isian Anda tetap di halaman ini. Buka kembali kanal dari daftar untuk memeriksa data terbaru."
				hideCancelButton
				confirmText="Tutup"
			/>
		</>
	);
}
