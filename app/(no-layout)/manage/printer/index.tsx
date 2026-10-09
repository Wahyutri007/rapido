import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { Colors } from "@/constants/Colors";
import { PRINTER_ITEMS } from "@/constants/data/other/printer";

function PrinterItem({
	id,
	name,
	description,
}: (typeof PRINTER_ITEMS)[number]) {
	const [actionsOpen, setActionsOpen] = React.useState(false);
	const unavailableModal = useAlertModal();
	return (
		<>
			<AlertModal
				title="Belum dapat menghapus printer"
				message="Ini adalah data contoh. Printer belum terhubung dan tidak ada data yang dihapus."
				openState={unavailableModal.openState}
				hideCancelButton
				confirmText="Tutup"
			/>
			<ItemActionSheet
				isOpen={actionsOpen}
				onClose={() => setActionsOpen(false)}
				title={name}
				entityName="Printer"
				editSubtitle="Lihat pratinjau pengaturan printer"
				deleteSubtitle="Penghapusan belum tersedia pada data contoh"
				onEdit={() => router.push(`/manage/printer/modify?id=${id}`)}
				onDelete={unavailableModal.open}
			/>
			<Card className="flex-row items-center justify-between gap-3">
				<View className="flex-1 gap-1">
					<Text size="normal" w="semibold">
						{name}
					</Text>
					<Text size="small" className="text-muted">
						{description}
					</Text>
				</View>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`Aksi printer ${name}`}
					onPress={() => setActionsOpen(true)}
					className="size-10 items-center justify-center"
				>
					<Feather name="more-horizontal" size={20} color={Colors.light.text} />
				</Pressable>
			</Card>
		</>
	);
}

export default function PrinterScreen() {
	return (
		<>
			<Wrapper isNotScrollable>
				<FlatList
					data={PRINTER_ITEMS}
					keyExtractor={(item) => item.id}
					className="flex-1"
					contentContainerStyle={{ padding: 16, paddingBottom: 128, gap: 16 }}
					ListHeaderComponent={
						<Card className="gap-1">
							<Text size="normal" w="semibold">
								Pratinjau printer
							</Text>
							<Text size="small" className="text-muted">
								Daftar ini berisi data contoh dan belum terhubung ke perangkat.
								Tambah, edit, dan hapus belum menyimpan perubahan.
							</Text>
						</Card>
					}
					renderItem={({ item }) => <PrinterItem {...item} />}
					showsVerticalScrollIndicator={false}
				/>
			</Wrapper>
			<BottomActionButton onPress={() => router.push("/manage/printer/modify")}>
				Tambah Printer
			</BottomActionButton>
		</>
	);
}
