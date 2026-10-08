import { create } from "zustand";

export type OperatorItemStatus = "menunggu" | "diproses" | "selesai";

export type OperatorOrderItem = {
	id: string;
	name: string;
	quantity: number;
	notes?: string;
	status: OperatorItemStatus;
};

export type OperatorOrderStatus = "baru" | "diproses" | "selesai";

export type OperatorOrder = {
	id: string;
	orderNumber: string;
	customerName: string;
	queueNumber: string;
	timeAgo: string;
	status: OperatorOrderStatus;
	items: OperatorOrderItem[];
	responsibleStaff?: string;
	completedDuration?: string;
};

const INITIAL_ORDERS: OperatorOrder[] = [
	{
		id: "ORD-10232",
		orderNumber: "#ORD-10232",
		customerName: "Listia",
		queueNumber: "Antrian #3",
		timeAgo: "30 menit lalu",
		status: "baru",
		items: [
			{
				id: "item-1",
				name: "Nasi padang",
				quantity: 5,
				notes: "Banyakin nasi dan tambahin rawit,jangan terlalu asin",
				status: "diproses",
			},
			{
				id: "item-2",
				name: "Jus Pokat",
				quantity: 1,
				notes: "Es Batunya sedikit aja",
				status: "menunggu",
			},
			{
				id: "item-3",
				name: "Ayam Cabe Merah",
				quantity: 5,
				notes: "lado yang padeh bana",
				status: "diproses",
			},
			{
				id: "item-4",
				name: "Pisang Bakar Coklat",
				quantity: 1,
				status: "diproses",
			},
		],
	},
	{
		id: "ORD-10229",
		orderNumber: "#ORD-10229",
		customerName: "Arianja",
		queueNumber: "Antrian #2",
		timeAgo: "40 menit lalu",
		status: "diproses",
		responsibleStaff: "Ulil Amri",
		items: [
			{
				id: "item-201",
				name: "Nasi Goreng Spesial",
				quantity: 1,
				notes: "Pedas sedang",
				status: "diproses",
			},
			{
				id: "item-202",
				name: "Es Teh Manis",
				quantity: 1,
				status: "diproses",
			},
			{
				id: "item-203",
				name: "Kerupuk Kulit",
				quantity: 1,
				status: "menunggu",
			},
		],
	},
	{
		id: "ORD-10228",
		orderNumber: "#ORD-10228",
		customerName: "Taufiqur rahman",
		queueNumber: "Antrian #1",
		timeAgo: "50 menit lalu",
		status: "selesai",
		responsibleStaff: "Ulil Amri",
		completedDuration: "Selesai dalam 10 Menit",
		items: [
			{
				id: "item-301",
				name: "Ayam Geprek Sambal Korek",
				quantity: 2,
				status: "selesai",
			},
			{
				id: "item-302",
				name: "Nasi Putih",
				quantity: 2,
				status: "selesai",
			},
			{
				id: "item-303",
				name: "Air Mineral Dingin",
				quantity: 1,
				status: "selesai",
			},
		],
	},
	{
		id: "ORD-10227",
		orderNumber: "#ORD-10227",
		customerName: "Agisti",
		queueNumber: "Antrian #4",
		timeAgo: "1 jam lalu",
		status: "selesai",
		responsibleStaff: "Ulil Amri",
		completedDuration: "Selesai dalam 20 Menit",
		items: [
			{
				id: "item-401",
				name: "Bebek Goreng Crispy",
				quantity: 2,
				status: "selesai",
			},
		],
	},
	{
		id: "ORD-10226",
		orderNumber: "#ORD-10226",
		customerName: "Julie",
		queueNumber: "Antrian #5",
		timeAgo: "1 jam lalu",
		status: "selesai",
		responsibleStaff: "Ulil Amri",
		completedDuration: "Selesai dalam 23 Menit",
		items: [
			{
				id: "item-501",
				name: "Paket Hemat Geprek",
				quantity: 3,
				status: "selesai",
			},
		],
	},
];

type OperatorStore = {
	orders: OperatorOrder[];
	activeTab: OperatorOrderStatus;
	searchQuery: string;
	setActiveTab: (tab: OperatorOrderStatus) => void;
	setSearchQuery: (query: string) => void;
	takeJob: (orderId: string, staffName?: string) => void;
	processItem: (orderId: string, itemId: string) => void;
	completeOrder: (orderId: string) => void;
	resetOrders: () => void;
};

export const useOperatorStore = create<OperatorStore>((set) => ({
	orders: INITIAL_ORDERS,
	activeTab: "baru",
	searchQuery: "",
	setActiveTab: (tab) => set({ activeTab: tab }),
	setSearchQuery: (query) => set({ searchQuery: query }),
	takeJob: (orderId, staffName = "Ulil Amri") => {
		set((state) => ({
			orders: state.orders.map((order) => {
				if (order.id !== orderId) return order;
				return {
					...order,
					status: "diproses",
					responsibleStaff: staffName,
				};
			}),
		}));
	},
	processItem: (orderId, itemId) => {
		set((state) => ({
			orders: state.orders.map((order) => {
				if (order.id !== orderId) return order;
				const updatedItems = order.items.map((item) => {
					if (item.id !== itemId) return item;
					return {
						...item,
						status: "diproses" as OperatorItemStatus,
					};
				});
				return {
					...order,
					items: updatedItems,
				};
			}),
		}));
	},
	completeOrder: (orderId) => {
		set((state) => ({
			orders: state.orders.map((order) => {
				if (order.id !== orderId) return order;
				return {
					...order,
					status: "selesai",
					completedDuration: order.completedDuration || "Selesai dalam 15 Menit",
					items: order.items.map((item) => ({
						...item,
						status: "selesai" as OperatorItemStatus,
					})),
				};
			}),
		}));
	},
	resetOrders: () => set({ orders: INITIAL_ORDERS }),
}));
