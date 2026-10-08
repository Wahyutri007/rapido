import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchBar from "@/components/common/SearchBar";
import SuccessModal, { useAlertModal } from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { Colors } from "@/constants/Colors";
import type { NotificationSchedule } from "@/constants/data/manage/notification-schedules";
import { useNotificationScheduleStore } from "@/store/notificationScheduleStore";

export default function AutomaticNotificationsScreen() {
	const { schedules, deleteSchedule } = useNotificationScheduleStore();
	const [search, setSearch] = React.useState("");

	// ActionSheet state
	const [selectedSchedule, setSelectedSchedule] =
		React.useState<NotificationSchedule | null>(null);
	const [isActionSheetOpen, setIsActionSheetOpen] = React.useState(false);

	// Delete confirmation modal state
	const deleteModal = useAlertModal();
	const deleteSuccessModal = useAlertModal();
	const [scheduleToDelete, setScheduleToDelete] =
		React.useState<NotificationSchedule | null>(null);

	// Calculate counts
	const activeCount = schedules.filter((s) => s.status === "active").length;
	const inactiveCount = schedules.filter((s) => s.status === "inactive").length;
	const totalRecipients = schedules.reduce(
		(sum, s) => sum + s.recipientCount,
		0,
	);

	// Filtered schedules
	const filteredSchedules = React.useMemo(() => {
		if (!search.trim()) return schedules;
		const q = search.toLowerCase();
		return schedules.filter(
			(s) =>
				s.title.toLowerCase().includes(q) ||
				s.outlet.toLowerCase().includes(q) ||
				s.frequency.toLowerCase().includes(q),
		);
	}, [schedules, search]);

	const handleOpenActions = (schedule: NotificationSchedule) => {
		setSelectedSchedule(schedule);
		setIsActionSheetOpen(true);
	};

	const handleConfirmDelete = () => {
		if (scheduleToDelete) {
			deleteSchedule(scheduleToDelete.id);
			deleteModal.close();
			deleteSuccessModal.open();
		}
	};

	return (
		<>
			<Wrapper hasBottomBar contentContainerStyle={{ padding: 16, gap: 16 }}>
				{/* Top Summary Stats Cards */}
				<View className="flex-row gap-3">
					<Card className="flex-1 items-center p-3">
						<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
							<Feather name="calendar" size={17} color={Colors.primary} />
						</View>
						<Text size="small" className="mt-1.5 text-muted">
							Aktif
						</Text>
						<Text size="body" w="bold" className="text-primary">
							{activeCount}
						</Text>
					</Card>

					<Card className="flex-1 items-center p-3">
						<View className="size-9 items-center justify-center rounded-xl bg-warning-bg">
							<Feather name="pause-circle" size={17} color="#d97706" />
						</View>
						<Text size="small" className="mt-1.5 text-muted">
							Nonaktif
						</Text>
						<Text size="body" w="bold" className="text-warning">
							{inactiveCount}
						</Text>
					</Card>

					<Card className="flex-1 items-center p-3">
						<View className="size-9 items-center justify-center rounded-xl bg-success-bg">
							<Feather name="users" size={17} color={Colors.green[500]} />
						</View>
						<Text size="small" className="mt-1.5 text-muted">
							Total. Penerima
						</Text>
						<Text size="body" w="bold" className="text-success">
							{totalRecipients}
						</Text>
					</Card>
				</View>

				{/* Search Bar */}
				<SearchBar
					search={search}
					setSearch={setSearch}
					placeholder="Cari..."
					variant="light"
				/>

					{/* Schedules List Section */}
					<View className="gap-2.5">
						<Text size="normal" w="medium" className="text-muted">
							Daftar Jadwal
						</Text>

						{filteredSchedules.length === 0 ? (
							<Card className="items-center justify-center py-10">
								<Feather name="inbox" size={36} color={Colors.zinc[300]} />
								<Text size="normal" className="mt-2 text-muted">
									Tidak ada jadwal ditemukan
								</Text>
							</Card>
						) : (
							filteredSchedules.map((item) => (
								<BouncyPressable
									key={item.id}
									onPress={() =>
										router.push({
											pathname: "/manage/pos-settings/notification-detail",
											params: { id: item.id },
										})
									}
									activeScale={0.98}
								>
									<Card className="gap-2.5 p-4">
										{/* Header row: Title, Status Badge, More menu */}
										<View className="flex-row items-center justify-between">
											<View className="flex-1 flex-row items-center gap-2 mr-2">
												<Text
													size="normal"
													w="bold"
													numberOfLines={1}
													className="text-foreground"
												>
													{item.title}
												</Text>
												<View
													className={`rounded-full px-2 py-0.5 ${
														item.status === "active"
															? "bg-emerald-100"
															: "bg-amber-100"
													}`}
												>
													<Text
														size="small"
														w="medium"
														className={
															item.status === "active"
																? "text-emerald-700"
																: "text-amber-700"
														}
													>
														{item.status === "active" ? "Aktif" : "Nonaktif"}
													</Text>
												</View>
											</View>

											<Pressable
												onPress={(e) => {
													e.stopPropagation?.();
													handleOpenActions(item);
												}}
												hitSlop={8}
												className="p-1"
											>
												<Feather
													name="more-horizontal"
													size={20}
													color={Colors.zinc[500]}
												/>
											</Pressable>
										</View>

										{/* Info Row 1: Frequency & Time */}
										<View className="flex-row items-center gap-4">
											<View className="flex-row items-center gap-1.5">
												<Feather
													name="calendar"
													size={14}
													color={Colors.zinc[400]}
												/>
												<Text size="small" className="text-muted">
													{item.frequency}
												</Text>
											</View>
											<View className="flex-row items-center gap-1.5">
												<Feather
													name="clock"
													size={14}
													color={Colors.zinc[400]}
												/>
												<Text size="small" className="text-muted">
													{item.time}
												</Text>
											</View>
										</View>

										{/* Info Row 2: Channels */}
										<View className="flex-row items-center gap-1.5">
											<Feather name="mail" size={14} color={Colors.zinc[400]} />
											<Text size="small" className="text-muted">
												{item.channels
													.map((c) => (c === "email" ? "Email" : "WhatsApp"))
													.join(", ")}
											</Text>
										</View>

										{/* Info Row 3: Recipient count */}
										<View className="flex-row items-center gap-1.5">
											<Feather name="user" size={14} color={Colors.zinc[400]} />
											<Text size="small" className="text-muted">
												{item.recipientCount} Penerima
											</Text>
										</View>
									</Card>
								</BouncyPressable>
							))
						)}
					</View>
			</Wrapper>
			{/* Bottom Action Button: Buat Jadwal Baru */}
			<BottomActionButton
				onPress={() => router.push("/manage/pos-settings/notification-modify")}
			>
				Buat Jadwal Baru
			</BottomActionButton>

			{/* Item Action Sheet */}
			<ItemActionSheet
				isOpen={isActionSheetOpen}
				onClose={() => setIsActionSheetOpen(false)}
				title={selectedSchedule?.title}
				onViewDetail={() => {
					if (selectedSchedule) {
						router.push({
							pathname: "/manage/pos-settings/notification-detail",
							params: { id: selectedSchedule.id },
						});
					}
				}}
				onEdit={() => {
					if (selectedSchedule) {
						router.push({
							pathname: "/manage/pos-settings/notification-modify",
							params: { id: selectedSchedule.id },
						});
					}
				}}
				onDelete={() => {
					if (selectedSchedule) {
						setScheduleToDelete(selectedSchedule);
						deleteModal.open();
					}
				}}
			/>

			{/* Delete Confirm Modal */}
			<DeleteConfirmModal
				openState={deleteModal.openState}
				onConfirm={handleConfirmDelete}
				title={`Apakah yakin ingin menghapus jadwal '${scheduleToDelete?.title}'?`}
				description="Jadwal pemberitahuan otomatis ini akan dihapus permanen."
			/>

			{/* Delete Success Modal */}
			<SuccessModal
				openState={deleteSuccessModal.openState}
				onClose={deleteSuccessModal.close}
				title="Jadwal Berhasil Dihapus"
				description="Jadwal pemberitahuan otomatis telah berhasil dihapus."
				buttonText="Tutup"
			/>
		</>
	);
}
