import { Image, View } from "react-native";
import { INVENTORY_IMAGES } from "@/assets/images/inventory";
import Text from "@/components/common/Text";
import { formatRp } from "@/lib/utils";
import { InventoryIcon } from "../InventoryUi";

export function CompositionImage({ productId }: { productId: string }) {
	const source =
		productId === "ayam-geprek" || productId === "ayam-bakar"
			? INVENTORY_IMAGES.ayam
			: productId === "chicken-katsu"
				? INVENTORY_IMAGES.katsu
				: productId === "mie-goreng"
					? INVENTORY_IMAGES.mie
					: undefined;
	return source ? (
		<Image
			source={source}
			style={{ width: 64, height: 64 }}
			resizeMode="cover"
			className="rounded-lg"
			accessibilityLabel="Foto produk"
		/>
	) : (
		<View className="size-16 items-center justify-center rounded-lg bg-primary-50">
			<InventoryIcon name="package" size={24} />
		</View>
	);
}

export function CompositionStatus({ configured }: { configured: boolean }) {
	return (
		<View
			className={`self-start rounded-lg px-2 py-1 ${configured ? "bg-success-bg" : "bg-warning-bg"}`}
		>
			<Text
				size="small"
				className={configured ? "text-success" : "text-warning"}
			>
				{configured ? "Sudah Teresep" : "Belum Teresep"}
			</Text>
		</View>
	);
}

export function formatCompositionMoney(amount?: number) {
	return amount !== undefined && Number.isFinite(amount)
		? formatRp(amount)
		: "-";
}

export function formatCompositionPercent(amount?: number) {
	return amount !== undefined && Number.isFinite(amount)
		? `${amount.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`
		: "-";
}
