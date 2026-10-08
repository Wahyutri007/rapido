import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { ScrollView, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { TRANSACTION_ITEMS } from "@/constants/data/transaction/transaction";
import useCustomRouter from "@/hooks/useCustomRouter";
import useDayJS from "@/hooks/useDayJs";
import { cn, formatRp } from "@/lib/utils";
import type { TransactionItemProps } from "@/types/ui/transaction/transaction";

type TransactionItemType = "default" | "history";

const TransactionContext = React.createContext<{
	transaction?: TransactionItemProps | null;
	type?: TransactionItemType;
}>({ transaction: undefined });

function useTransactionContext() {
	const context = React.useContext(TransactionContext);
	if (!context) {
		throw new Error(
			"useTransactionContext must be used within a TransactionProvider",
		);
	}
	return context;
}

function Header() {
	const { transaction } = useTransactionContext();

	return (
		<View className="items-center">
			<Feather name="check" size={32} color={Colors.primary} />
			<Text className="text-sm text-muted">Pesanan Berhasil Dibuat</Text>
			<Text className="mt-1 text-[20px] text-gray-900" w="semibold">
				{formatRp(transaction?.total ?? 0)}
			</Text>
			<View className="mt-2 flex-row items-center gap-2">
				<Text className="text-sm text-muted" w="medium">
					{transaction?.paymentMethod.name}
				</Text>
				<View className="size-1 rounded-full bg-gray-200" />
				<Text className="text-sm text-muted" w="medium">
					{transaction?.orderType}
				</Text>
			</View>
		</View>
	);
}

function Summary() {
	const { transaction, type } = useTransactionContext();
	const { dayjs } = useDayJS();

	return (
		<View className="gap-3 rounded-[20px] bg-primary-50/35 p-5">
			<View className="flex-row justify-between">
				<Text className="flex-1 text-sm">Waktu Pesanan</Text>
				<Text className="flex-1 text-right text-sm text-gray-900" w="medium">
					{dayjs(new Date(transaction?.date ?? new Date())).format(
						"dddd, DD MMM YYYY, HH:mm:ss",
					)}
				</Text>
			</View>
			<View className="flex-row justify-between">
				<Text className="flex-1 text-sm">Nomor Transaksi</Text>
				<Text className="flex-1 text-right text-sm text-gray-900" w="medium">
					{transaction?.transactionId}
				</Text>
			</View>
			{type === "history" && (
				<View className="flex-row justify-between">
					<Text className="flex-1 text-sm">
						Status Pembayaran
					</Text>
					<Text
						className={cn(
							"flex-1 text-right text-sm",
							transaction?.statuses.isPaid
								? "text-success-200"
								: "text-warning-200",
						)}
						w="medium"
					>
						{transaction?.statuses.isPaid ? "Dibayar" : "Belum Dibayar"}
					</Text>
				</View>
			)}
			<View className="flex-row justify-between">
				<Text className="flex-1 text-sm">Status Pesanan</Text>
				<Text
					className={cn(
						"flex-1 text-right text-sm",
						transaction?.statuses.isFinished
							? "text-success-200"
							: "text-warning-200",
					)}
					w="medium"
				>
					{!transaction?.statuses.isFinished ? "Sedang Diproses" : "Selesai"}
				</Text>
			</View>
		</View>
	);
}

function Details() {
	const { transaction } = useTransactionContext();

	return (
		<View className="gap-3 rounded-[20px] bg-primary-50/35 p-5">
			<Text className="txt-sm text-gray-900" w="medium">
				Ringkasan Pesanan
			</Text>
			<View className="mt-6 gap-3">
				{transaction?.orders.map((item) => {
					const totalPrice =
						(item.variants.reduce((acc, variant) => acc + variant.price, 0) +
							(item.menu.sell_price || 0)) *
						item.amount;

					return (
						<View
							key={item.id}
							className="flex-row items-center justify-between gap-3"
						>
							<View className="flex-row items-center" style={{ flex: 5 }}>
								<View style={{ flex: 5 }}>
									<Text className="text-sm text-gray-900" w="semibold">
										{item.menu.name}
									</Text>
									<View className="mt-1 gap-1">
										{item.variants.map((variant) => (
											<Text className="text-xs" key={variant.id}>
												{variant.name}
											</Text>
										))}
									</View>
								</View>
								<Text className="text-sm" style={{ flex: 1 }}>
									x{item.amount}
								</Text>
							</View>
							<Text
								className="text-right text-sm text-gray-900"
								w="medium"
								style={{ flex: 2 }}
							>
								{formatRp(totalPrice)}
							</Text>
						</View>
					);
				})}
			</View>
		</View>
	);
}

function TransactionPrices() {
	const { transaction } = useTransactionContext();

	return (
		<View className="gap-3 rounded-[20px] bg-primary-50/35 p-5">
			<View className="flex-row items-center justify-between">
				<Text className="text-sm">Subtotal</Text>
				<Text className="text-sm">
					{formatRp(transaction?.total ?? 0)}
				</Text>
			</View>
			<View className="flex-row items-center justify-between">
				<Text className="text-sm">Pajak</Text>
				<Text className="text-sm">
					{formatRp(transaction?.tax ?? 0)}
				</Text>
			</View>
			<View className="flex-row items-center justify-between">
				<Text className="text-sm">Lainnya</Text>
				<Text className="text-sm">
					{formatRp(transaction?.other ?? 0)}
				</Text>
			</View>
			<View className="flex-row items-center justify-between">
				<Text className="text-sm text-gray-900" w="semibold">
					Total
				</Text>
				<Text className="text-sm text-gray-900" w="semibold">
					{formatRp(transaction?.total ?? 0)}
				</Text>
			</View>
		</View>
	);
}

function ContextProvider({
	children,
	transaction,
	type,
}: React.PropsWithChildren<{
	transaction?: TransactionItemProps | null;
	type?: TransactionItemType;
}>) {
	return (
		<TransactionContext.Provider value={{ transaction, type }}>
			{children}
		</TransactionContext.Provider>
	);
}

export default function TransactionDetails({
	transaction,
	type = "default",
}: {
	transaction?: TransactionItemProps | null;
	type?: TransactionItemType;
}) {
	return (
		<View>
			<ContextProvider transaction={transaction} type={type}>
				<Header />
				<View className="mx-5 mt-5">
					<Summary />
				</View>
				<View className="mx-5 mt-5">
					<Details />
				</View>
				<View className="mx-5 mt-5">
					<TransactionPrices />
				</View>
			</ContextProvider>
		</View>
	);
}
