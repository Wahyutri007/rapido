import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

export type ProductItem = {
	id: string;
	name: string;
	category: string;
	stock: number;
	image?: string;
	barcode?: string;
	status?: "Aktif" | "Nonaktif";
};

export const MOCK_PRODUCTS: ProductItem[] = [
	{
		id: "prod-1",
		name: "Bakmie",
		category: "Makanan",
		stock: 48,
		image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200",
		barcode: "POS-PRD-000128",
		status: "Aktif",
	},
	{
		id: "prod-2",
		name: "Salad Yumme",
		category: "Makanan",
		stock: 32,
		image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200",
		barcode: "POS-PRD-000129",
		status: "Aktif",
	},
	{
		id: "prod-3",
		name: "Mie Goreng Dumai",
		category: "Makanan",
		stock: 24,
		image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=200",
		barcode: "POS-PRD-000130",
		status: "Aktif",
	},
	{
		id: "prod-4",
		name: "Roti Sosis Jumbo",
		category: "Makanan",
		stock: 15,
		image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=200",
		barcode: "POS-PRD-000131",
		status: "Aktif",
	},
	{
		id: "prod-5",
		name: "Fried Chicken",
		category: "Makanan",
		stock: 50,
		image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200",
		barcode: "POS-PRD-000132",
		status: "Aktif",
	},
	{
		id: "prod-6",
		name: "Nasi Goreng Seafood",
		category: "Makanan",
		stock: 40,
		image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200",
		barcode: "POS-PRD-000133",
		status: "Aktif",
	},
	{
		id: "prod-7",
		name: "Dessert Berry",
		category: "Minuman",
		stock: 18,
		image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200",
		barcode: "POS-PRD-000134",
		status: "Aktif",
	},
	{
		id: "prod-8",
		name: "Chicken Club Sandwich",
		category: "Makanan",
		stock: 22,
		image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200",
		barcode: "POS-PRD-000135",
		status: "Aktif",
	},
];

type ProductPickerSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedProductId?: string;
	onSelect: (product: ProductItem) => void;
	products?: ProductItem[];
};

export default function ProductPickerSheet({
	isOpen,
	onClose,
	selectedProductId,
	onSelect,
	products = MOCK_PRODUCTS,
}: ProductPickerSheetProps) {
	const [search, setSearch] = React.useState("");
	const [tempSelectedId, setTempSelectedId] = React.useState<string | undefined>(
		selectedProductId,
	);

	React.useEffect(() => {
		if (isOpen) {
			setTempSelectedId(selectedProductId);
			setSearch("");
		}
	}, [isOpen, selectedProductId]);

	const filtered = React.useMemo(() => {
		if (!search.trim()) return products;
		return products.filter((p) =>
			p.name.toLowerCase().includes(search.toLowerCase()),
		);
	}, [products, search]);

	const handleDone = () => {
		const chosen = products.find((p) => p.id === tempSelectedId);
		if (chosen) {
			onSelect(chosen);
		}
		onClose();
	};

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="max-h-[85%] bg-white px-0 pb-6 rounded-t-3xl">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				{/* Header */}
				<View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-3 w-full">
					<Pressable onPress={onClose} hitSlop={10}>
						<Text size="normal" className="text-primary" w="medium">
							Batal
						</Text>
					</Pressable>
					<Text size="body" w="bold" className="text-foreground">
						Pilih Produk
					</Text>
					<Pressable onPress={handleDone} hitSlop={10}>
						<Text size="normal" className="text-primary" w="semibold">
							Selesai
						</Text>
					</Pressable>
				</View>

				{/* Search Bar */}
				<View className="px-5 pt-4 pb-2 w-full">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari..."
						variant="light"
						className="bg-zinc-50 border border-gray-200"
					/>
				</View>

				{/* Product List */}
				<ScrollView className="w-full px-5 pt-2" showsVerticalScrollIndicator={false}>
					<View className="gap-2.5 pb-6">
						{filtered.map((product) => {
							const isSelected = tempSelectedId === product.id;
							return (
								<Pressable
									key={product.id}
									onPress={() => setTempSelectedId(product.id)}
									className={cn(
										"flex-row items-center gap-3 rounded-2xl border p-3.5 transition-all",
										isSelected
											? "border-primary bg-primary-50/20"
											: "border-gray-200 bg-white",
									)}
								>
									{/* Radio Icon */}
									<View
										className={cn(
											"size-6 items-center justify-center rounded-full border",
											isSelected
												? "border-primary bg-primary"
												: "border-gray-300 bg-white",
										)}
									>
										{isSelected && (
											<Feather name="check" size={14} color="#ffffff" />
										)}
									</View>

									{/* Thumbnail */}
									<View className="size-11 overflow-hidden rounded-xl bg-gray-100 items-center justify-center">
										{product.image ? (
											<Image
												source={{ uri: product.image }}
												className="size-full"
												resizeMode="cover"
											/>
										) : (
											<Ionicons name="fast-food-outline" size={20} color={Colors.zinc[400]} />
										)}
									</View>

									{/* Info */}
									<View className="flex-1 justify-center">
										<Text w="semibold" size="normal" className="text-foreground">
											{product.name}
										</Text>
										<Text size="small" className="text-muted">
											{product.category} · Stok: {product.stock}
										</Text>
									</View>
								</Pressable>
							);
						})}
					</View>
				</ScrollView>
			</ActionsheetContent>
		</Actionsheet>
	);
}
