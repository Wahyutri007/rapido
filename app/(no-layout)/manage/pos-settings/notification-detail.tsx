import Feather from "@expo/vector-icons/Feather";
import { router, useGlobalSearchParams } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal, { useAlertModal } from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import { Colors } from "@/constants/Colors";
import { useNotificationScheduleStore } from "@/store/notificationScheduleStore";

export default function NotificationDetailScreen() {
	const params = useGlobalSearchParams<{ id?: string }>();
	const { getSchedule, deleteSchedule } = useNotificationScheduleStore();

	const deleteModal = useAlertModal();
	const deleteSuccessModal = useAlertModal();

	const schedule = params.id ? getSchedule(params.id) : undefined;

	if (!schedule) {
		return (
			<Wrapper className="items-center justify-center p-6">
				<Feather name="alert-circle" size={40} color={Colors.zinc[400]} />
				<Text size="body" w="semibold" className="mt-3 text-foreground">
					Jadwal tidak ditemukan
				</Text>
				<Pressable
					onPress={() => router.back()}
					className="mt-4 rounded-xl bg-primary px-4 py-2"
				>
					<Text size="normal" w="semibold" className="text-white">
						Kembali
					</Text>
				</Pressable>
			</Wrapper>
		);
	}

	const handleEdit = () => {
		router.push({
			pathname: "/manage/pos-settings/notification-modify",
			params: { id: schedule.id },
		});
	};

	const handleDelete = () => {
		deleteModal.open();
	};

	const handleConfirmDelete = () => {
		deleteSchedule(schedule.id);
		deleteModal.close();
		deleteSuccessModal.open();
	};

	return (
		<Wrapper className="px-4 pt-4 pb-28 gap-4">
			{/* Top Header Card */}
			<Card className="flex-row items-center gap-3.5 p-4">
				<View className="size-14 items-center justify-center rounded-2xl bg-primary-50">
					<Feather name="calendar" size={26} color={Colors.primary} />
				</View>
				<View className="flex-1">
					<View className="flex-row items-center gap-2">
						<Text
							size="body"
							w="bold"
							numberOfLines={1}
							className="text-foreground flex-1"
						>
							{schedule.title}
						</Text>
						<View
							className={`rounded-full px-2.5 py-0.5 ${
								schedule.status === "active"
									? "bg-emerald-100"
									: "bg-amber-100"
							}`}
						>
							<Text
								size="small"
								w="semibold"
								className={
									schedule.status === "active"
										? "text-emerald-700"
										: "text-amber-700"
								}
							>
								{schedule.status === "active" ? "Aktif" : "Nonaktif"}
							</Text>
						</View>
					</View>

					<Text size="small" className="mt-1 text-muted">
						Dibuat: {schedule.createdAt}
					</Text>
					<Text size="small" className="text-muted">
						Dibuat oleh: {schedule.createdBy}
					</Text>
				</View>
			</Card>

			{/* Status & Timing Detail Card */}
			<Card className="px-4 py-1">
				<DetailRow label="Status">
					<Text
						size="normal"
						w="semibold"
						className={
							schedule.status === "active"
								? "text-emerald-600"
								: "text-amber-600"
						}
					>
						{schedule.status === "active" ? "Aktif" : "Nonaktif"}
					</Text>
				</DetailRow>

				<DetailRow label="Kirim Berikutnya">
					<View className="flex-row items-center gap-1.5">
						<Feather name="calendar" size={14} color={Colors.primary} />
						<Text size="normal" className="text-muted">
							{schedule.nextRun}
						</Text>
					</View>
				</DetailRow>

				<DetailRow label="Frekuensi" value={schedule.frequency} />
				<DetailRow label="Outlet / Toko" value={schedule.outlet} isLast />
			</Card>

			{/* Ringkasan Pengaturan */}
			<View className="gap-2">
				<Text size="normal" w="medium" className="text-muted">
					Ringkasan Pengaturan
				</Text>
				<Card className="px-4 py-1">
					<DetailRow
						label="Laporan Dipilih"
						value={`${schedule.reports.length} Laporan`}
					/>
					<DetailRow
						label="Laporan Melalui"
						value={schedule.channels
							.map((c) => (c === "email" ? "Email" : "WhatsApp"))
							.join(", ")}
					/>
					<DetailRow
						label="Laporan Penerima"
						value={`${schedule.recipientCount} Penerima`}
						isLast
					/>
				</Card>
			</View>

			{/* Daftar Penerima */}
			<View className="gap-2">
				<Text size="normal" w="medium" className="text-muted">
					Daftar Penerima
				</Text>
				<Card className="px-4 py-2">
					{schedule.recipients.map((rec, index) => (
						<View
							key={`${rec.value}-${index}`}
							className={`flex-row items-center gap-3 py-3 ${
								index !== schedule.recipients.length - 1
									? "border-b border-gray-100"
									: ""
							}`}
						>
							<Feather
								name={rec.type === "email" ? "mail" : "phone"}
								size={16}
								color={Colors.primary}
							/>
							<Text size="normal" className="text-foreground">
								{rec.value}
							</Text>
						</View>
					))}
				</Card>
			</View>

			{/* Riwayat Pengiriman Terbaru */}
			<View className="gap-2">
				<Text size="normal" w="medium" className="text-muted">
					Riwayat Pengiriman Terbaru
				</Text>
				<Card className="px-4 py-3">
					{(schedule.deliveryHistory ?? [
						{
							id: "d-1",
							timestamp: "23 Mei 2024 08:00",
							status: "success" as const,
							message: "Berhasil dikirim ke 5 penerima",
						},
						{
							id: "d-2",
							timestamp: "22 Mei 2024 08:00",
							status: "success" as const,
							message: "Berhasil dikirim ke 5 penerima",
						},
						{
							id: "d-3",
							timestamp: "21 Mei 2024 08:00",
							status: "success" as const,
							message: "Berhasil dikirim ke 5 penerima",
						},
					]).map((item, idx, arr) => (
						<View
							key={item.id}
							className={`flex-row items-start gap-3 py-2.5 ${
								idx !== arr.length - 1 ? "border-b border-gray-100" : ""
							}`}
						>
							<Feather
								name="check-circle"
								size={17}
								color={Colors.primary}
								className="mt-0.5"
							/>
							<View className="flex-1">
								<Text size="small" w="medium" className="text-foreground">
									{item.timestamp}
								</Text>
								<Text size="small" className="text-muted">
									{item.message}
								</Text>
							</View>
						</View>
					))}

					<Pressable className="mt-2.5 flex-row items-center justify-between border-t border-gray-100 pt-3">
						<Text size="normal" w="semibold" className="text-primary">
							Lihat semua riwayat
						</Text>
						<Feather name="chevron-right" size={16} color={Colors.primary} />
					</Pressable>
				</Card>
			</View>

			{/* Bottom Actions: Edit and Hapus */}
			<DetailBottomActions onEdit={handleEdit} onDelete={handleDelete} />

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				openState={deleteModal.openState}
				onConfirm={handleConfirmDelete}
				title={`Apakah yakin ingin menghapus jadwal '${schedule.title}'?`}
				description="Jadwal pemberitahuan otomatis ini akan dihapus permanen."
			/>

			{/* Success Modal after deletion */}
			<SuccessModal
				openState={deleteSuccessModal.openState}
				onClose={() => {
					deleteSuccessModal.close();
					router.back();
				}}
				title="Jadwal Berhasil Dihapus"
				description="Jadwal pemberitahuan otomatis telah berhasil dihapus."
				buttonText="Tutup"
			/>
		</Wrapper>
	);
}
