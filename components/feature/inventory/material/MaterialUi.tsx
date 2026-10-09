import { Image, View } from "react-native";
import { INVENTORY_IMAGES } from "@/assets/images/inventory";
import Text from "@/components/common/Text";
import { materialStockStatus } from "@/lib/inventory-material";
import { cn } from "@/lib/utils";
import type {
	InventoryMaterial,
	MaterialStockStatus,
} from "@/types/ui/inventory/material";
import { InventoryIcon } from "../InventoryUi";

const IMAGES = {
	tepung: INVENTORY_IMAGES.tepung,
	gula: INVENTORY_IMAGES.gula,
	minyak: INVENTORY_IMAGES.minyak,
	"ayam-fillet": INVENTORY_IMAGES.fillet,
};
export const MATERIAL_STATUS_LABELS: Record<MaterialStockStatus, string> = {
	safe: "Aman",
	low: "Menipis",
	empty: "Habis",
};
export const formatMaterialQuantity = (quantity: number) =>
	quantity.toLocaleString("id-ID", { maximumFractionDigits: 6 });

export function MaterialImage({ material }: { material: InventoryMaterial }) {
	const source =
		material.id in IMAGES
			? IMAGES[material.id as keyof typeof IMAGES]
			: undefined;
	return source ? (
		<Image source={source} resizeMode="contain" className="size-12" />
	) : (
		<View className="size-12 items-center justify-center rounded-lg bg-primary-50">
			<InventoryIcon name="package" size={24} />
		</View>
	);
}

export function MaterialStatusBadge({
	material,
}: {
	material: InventoryMaterial;
}) {
	const status = materialStockStatus(material);
	return (
		<View
			className={cn("flex-row items-center gap-1 rounded-lg px-2 py-1", {
				"bg-success-bg": status === "safe",
				"bg-warning-bg": status === "low",
				"bg-error-bg": status === "empty",
			})}
		>
			<InventoryIcon
				name={status === "safe" ? "check-circle" : "alert-circle"}
				tone={
					status === "safe"
						? "success"
						: status === "low"
							? "warning"
							: "destructive"
				}
			/>
			<Text
				size="small"
				className={
					status === "safe"
						? "text-success"
						: status === "low"
							? "text-warning"
							: "text-destructive"
				}
			>
				{MATERIAL_STATUS_LABELS[status]}
			</Text>
		</View>
	);
}
