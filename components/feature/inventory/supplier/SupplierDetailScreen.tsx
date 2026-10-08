import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import { route } from "@/lib/utils";
import { useInventorySupplierStore } from "@/store/inventorySupplierStore";
import { InventoryIcon } from "../InventoryUi";
import SupplierDeleteDialog from "./SupplierDeleteDialog";

export default function SupplierDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const supplier = useInventorySupplierStore((state) =>
		state.suppliers.find((item) => item.id === id),
	);
	const [deleting, setDeleting] = React.useState(false);
	if (!supplier)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Pemasok tidak ditemukan" />
			</Wrapper>
		);
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card density="compact" className="flex-row items-center gap-3">
					<View className="size-12 items-center justify-center rounded-lg bg-primary-50">
						<InventoryIcon name="shopping-bag" size={24} />
					</View>
					<View className="flex-1 gap-1">
						<Text w="semibold">{supplier.name}</Text>
						<Text size="small" className="text-muted">
							Grup pemasok untuk mengelola item berdasarkan kategori.
						</Text>
					</View>
				</Card>
				<View className="gap-2">
					<Text size="normal" w="medium" className="text-muted">
						Informasi Pemasok
					</Text>
					<Card density="compact">
						<DetailRow icon="user" label="Nama Pemasok" value={supplier.name} />
						<DetailRow
							icon="map-pin"
							label="Alamat"
							value={supplier.address || "-"}
						/>
						<DetailRow
							icon="phone"
							label="No. Telepon"
							value={supplier.phone || "-"}
						/>
						<DetailRow
							icon="mail"
							label="Email"
							value={supplier.email || "-"}
						/>
						<DetailRow
							icon="map-pin"
							label="Provinsi"
							value={supplier.province || "-"}
						/>
						<DetailRow
							icon="map-pin"
							label="Kota"
							value={supplier.city || "-"}
						/>
						<DetailRow
							icon="map-pin"
							label="Kecamatan"
							value={supplier.district || "-"}
						/>
						<DetailRow
							icon="mail"
							label="Kode Pos"
							value={supplier.postalCode || "-"}
							isLast
						/>
					</Card>
				</View>
			</Wrapper>
			<DetailBottomActions
				onEdit={() => router.push(route("/inventory/suppliers/modify", { id }))}
				onDelete={() => setDeleting(true)}
			/>
			<SupplierDeleteDialog
				supplier={deleting ? supplier : undefined}
				onClose={() => setDeleting(false)}
				onDeleted={() => router.dismissTo(route("/inventory/suppliers"))}
			/>
		</>
	);
}
