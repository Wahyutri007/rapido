import type { ImageSourcePropType } from "react-native";
import { INVENTORY_IMAGES } from "@/assets/images/inventory";
import type { StockKind } from "@/types/ui/inventory";

export type InventoryRanking = {
	name: string;
	value: number;
	unit?: string;
	description?: string;
	image?: ImageSourcePropType;
};
export type InventoryInsight = {
	title: string;
	name: string;
	label: string;
	value: string;
	image: ImageSourcePropType;
	tone: "success" | "destructive" | "primary";
};
export type InventorySummary = {
	totals: [number, number, number, number];
	popularTitle: string;
	popular: InventoryRanking[];
	runningLowTitle: string;
	runningLow: InventoryRanking[];
	costTitle: string;
	costs: InventoryRanking[];
	lossTitle: string;
	losses: InventoryRanking[];
	restockTitle: string;
	restock: InventoryRanking[];
	recommendations: {
		name: string;
		amount: string;
		supplier: string;
		cost: number;
		image?: ImageSourcePropType;
	}[];
	insights: InventoryInsight[];
};

const materials = [
	"Tepung Terigu",
	"Gula Pasir",
	"Minyak Goreng",
	"Ayam Fillet",
	"Telur Ayam",
];
const products = [
	"Nasi Goreng Spesial",
	"Ayam Bakar Taliwang",
	"Mie Goreng",
	"Chicken Katsu",
	"Ayam Geprek",
];
const losses = [
	"Ayam Fillet",
	"Cabai Rawit",
	"Telur Ayam",
	"Daun Bawang",
	"Saus Sambal",
];

export const INVENTORY_SUMMARIES: Record<StockKind, InventorySummary> = {
	material: {
		totals: [128, 86, 28, 14],
		popularTitle: "Bahan paling sering dipakai",
		popular: materials.map((name, index) => ({
			name,
			value: [245, 160, 120, 98, 72][index],
			unit: "Kg",
		})),
		runningLowTitle: "Bahan yang akan habis",
		runningLow: [
			"Ayam Fillet",
			"Minyak Goreng",
			"Gula Pasir",
			"Telur Ayam",
			"Tepung Terigu",
		].map((name, index) => ({
			name,
			value: [2, 3, 5, 6, 8][index],
			unit: "hari",
		})),
		costTitle: "Bahan dengan biaya tertinggi",
		costs: [
			"Minyak Goreng",
			"Ayam Fillet",
			"Daging Sapi",
			"Keju Mozarella",
			"Mentega",
		].map((name, index) => ({
			name,
			value: [756000, 672000, 540000, 432000, 318000][index],
		})),
		lossTitle: "Bahan yang sering menyebabkan stok minus",
		losses: losses.map((name, index) => ({
			name,
			value: [7, 5, 4, 3, 2][index],
			unit: "x",
		})),
		restockTitle: "Bahan yang perlu segera restock",
		restock: losses.map((name, index) => ({
			name,
			value: [2, 3, 5, 6, 7][index],
			unit: "hari",
		})),
		recommendations: [
			{
				name: "Ayam Fillet",
				amount: "20 Kg",
				supplier: "FreshMart",
				cost: 640000,
				image: INVENTORY_IMAGES.fillet,
			},
			{
				name: "Minyak Goreng",
				amount: "25 Liter",
				supplier: "Sinar Abadi",
				cost: 450000,
				image: INVENTORY_IMAGES.minyak,
			},
			{
				name: "Gula Pasir",
				amount: "15 Kg",
				supplier: "Gula Kita",
				cost: 280000,
				image: INVENTORY_IMAGES.gula,
			},
			{
				name: "Tepung Terigu",
				amount: "20 Kg",
				supplier: "Sinar Jaya",
				cost: 165000,
				image: INVENTORY_IMAGES.tepung,
			},
		],
		insights: [
			{
				title: "Menu dengan cost bahan tertinggi",
				name: "Chicken Katsu",
				label: "Cost bahan",
				value: "Rp 28.450",
				image: INVENTORY_IMAGES.katsu,
				tone: "destructive",
			},
			{
				title: "Menu dengan margin paling tipis",
				name: "Ayam Bakar",
				label: "Margin",
				value: "12%",
				image: INVENTORY_IMAGES.ayam,
				tone: "destructive",
			},
			{
				title: "Bahan yang paling boros",
				name: "Chicken Katsu",
				label: "Pemakaian vs Rata-rata",
				value: "+38%",
				image: INVENTORY_IMAGES.mie,
				tone: "destructive",
			},
			{
				title: "Bahan yang stoknya sering tidak stabil",
				name: "Chicken Katsu",
				label: "Frekuensi tidak stabil",
				value: "8x /30hari",
				image: INVENTORY_IMAGES.katsu,
				tone: "destructive",
			},
		],
	},
	product: {
		totals: [156, 98, 32, 26],
		popularTitle: "Produk paling laris",
		popular: products.map((name, index) => ({
			name,
			value: [432, 318, 276, 224, 198][index],
			unit: "Pcs",
		})),
		runningLowTitle: "Produk yang akan habis",
		runningLow: products.map((name, index) => ({
			name,
			value: [2, 3, 4, 6, 9][index],
			unit: "hari",
		})),
		costTitle: "Produk dengan nilai stok tertinggi",
		costs: products.map((name, index) => ({
			name,
			value: [12450000, 672000, 540000, 432000, 318000][index],
		})),
		lossTitle: "Produk yang sering retur / rusak",
		losses: [
			"Chicken Katsu",
			"Ayam Geprek",
			"Ayam Bakar Taliwang",
			"Nasi Goreng Spesial",
			"Mie Goreng",
		].map((name, index) => ({
			name,
			value: [7, 5, 4, 3, 2][index],
			unit: "x",
		})),
		restockTitle: "Produk yang perlu segera restock",
		restock: products.map((name, index) => ({
			name,
			value: [2, 3, 5, 6, 7][index],
			unit: "hari",
		})),
		recommendations: products.map((name, index) => ({
			name,
			amount: `${[60, 48, 60, 48, 30][index]} Pcs`,
			supplier: [
				"Toko Rejeki",
				"Sinar Abadi",
				"Gula Kita",
				"Prima Utama",
				"Mega Jaya",
			][index],
			cost: [2970000, 2450000, 1950000, 1650000, 1800000][index],
		})),
		insights: [
			{
				title: "Produk margin tertinggi",
				name: "Ayam Bakar",
				label: "Margin",
				value: "28%",
				image: INVENTORY_IMAGES.ayam,
				tone: "success",
			},
			{
				title: "Produk paling laris",
				name: "Chicken Katsu",
				label: "Terjual",
				value: "432 Pcs",
				image: INVENTORY_IMAGES.katsu,
				tone: "primary",
			},
			{
				title: "Produk paling sering retur",
				name: "Chicken Katsu",
				label: "Retur",
				value: "3,2%",
				image: INVENTORY_IMAGES.mie,
				tone: "destructive",
			},
			{
				title: "Produk nilai stok tertinggi",
				name: "Chicken Katsu",
				label: "Nilai stok",
				value: "Rp 12.450.000",
				image: INVENTORY_IMAGES.katsu,
				tone: "primary",
			},
		],
	},
};

export const INGREDIENT_USAGE: InventoryRanking[] = [
	{
		name: "Chicken Katsu",
		description: "Tepung Terigu",
		value: 1,
		image: INVENTORY_IMAGES.katsu,
	},
	{
		name: "Ayam Bakar Taliwang",
		description: "Ayam Fillet",
		value: 2,
		image: INVENTORY_IMAGES.ayam,
	},
	{
		name: "Mie Goreng Spesial",
		description: "Gula Pasir",
		value: 3,
		image: INVENTORY_IMAGES.mie,
	},
];
