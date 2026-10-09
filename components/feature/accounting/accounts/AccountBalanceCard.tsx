import Entypo from "@expo/vector-icons/Entypo";
import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { WalletIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { FONT_NAMES } from "@/constants/Fonts";
import type { Account } from "@/types/ui/accounting/account";

type AccountBalanceCardProps = {
	account: Account;
	onMenuPress: (account: Account) => void;
	onBalanceChange: (id: string, debit: number, credit: number) => void;
};

export default function AccountBalanceCard({
	account,
	onMenuPress,
	onBalanceChange,
}: AccountBalanceCardProps) {
	const [balance, setBalance] = useState({
		id: account.id,
		debit: account.debit,
		credit: account.credit,
		debitText: account.debit > 0 ? account.debit.toString() : "",
		creditText: account.credit > 0 ? account.credit.toString() : "",
	});

	// Reconcile external balances before committing the inputs. An echoed edit
	// keeps its text draft; a reset or account switch adopts the external value.
	if (
		balance.id !== account.id ||
		!Object.is(balance.debit, account.debit) ||
		!Object.is(balance.credit, account.credit)
	) {
		const sameAccount = balance.id === account.id;
		setBalance({
			id: account.id,
			debit: account.debit,
			credit: account.credit,
			debitText:
				sameAccount &&
				(Object.is(balance.debit, account.debit) ||
					Number(balance.debitText) === account.debit)
					? balance.debitText
					: account.debit > 0
						? account.debit.toString()
						: "",
			creditText:
				sameAccount &&
				(Object.is(balance.credit, account.credit) ||
					Number(balance.creditText) === account.credit)
					? balance.creditText
					: account.credit > 0
						? account.credit.toString()
						: "",
		});
	}
	const { debitText, creditText } = balance;

	const handleDebitChange = (text: string) => {
		const clean = text.replace(/[^0-9]/g, "");
		setBalance((current) => ({ ...current, debitText: clean }));
		const num = clean ? parseInt(clean, 10) : 0;
		onBalanceChange(account.id, num, account.credit);
	};

	const handleCreditChange = (text: string) => {
		const clean = text.replace(/[^0-9]/g, "");
		setBalance((current) => ({ ...current, creditText: clean }));
		const num = clean ? parseInt(clean, 10) : 0;
		onBalanceChange(account.id, account.debit, num);
	};

	return (
		<Card className="rounded-2xl border border-gray-100">
			{/* Top row: Icon, Code & Name, Options Menu */}
			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center gap-3">
					<View className="size-10 items-center justify-center rounded-xl bg-blue-50">
						<WalletIcon color={Colors.primary} size={20} />
					</View>
					<View>
						<Text w="semibold" className="text-foreground text-sm">
							{account.code}
						</Text>
						<Text className="text-xs text-zinc-500">
							{account.name}
						</Text>
					</View>
				</View>

				<Pressable
					onPress={() => onMenuPress(account)}
					className="p-2"
					hitSlop={8}
				>
					<Entypo
						name="dots-three-horizontal"
						size={18}
						color={Colors.zinc[400]}
					/>
				</Pressable>
			</View>

			{/* Divider */}
			<View className="my-3 h-[1px] bg-gray-100" />

			{/* Bottom row: Debit & Kredit inputs */}
			<View className="flex-row gap-3">
				<View className="flex-1">
					<Text className="mb-1.5 text-xs text-zinc-700" w="medium">
						Debit
					</Text>
					<View className="h-11 justify-center rounded-lg border border-gray-200 bg-white px-3 focus:border-primary-500">
						<TextInput
							value={debitText}
							onChangeText={handleDebitChange}
							keyboardType="numeric"
							placeholder="0"
							placeholderTextColor={Colors.zinc[300]}
							className="text-sm text-foreground"
							style={{ fontFamily: FONT_NAMES.regular }}
						/>
					</View>
				</View>

				<View className="flex-1">
					<Text className="mb-1.5 text-xs text-zinc-700" w="medium">
						Kredit
					</Text>
					<View className="h-11 justify-center rounded-lg border border-gray-200 bg-white px-3 focus:border-primary-500">
						<TextInput
							value={creditText}
							onChangeText={handleCreditChange}
							keyboardType="numeric"
							placeholder="0"
							placeholderTextColor={Colors.zinc[300]}
							className="text-sm text-foreground"
							style={{ fontFamily: FONT_NAMES.regular }}
						/>
					</View>
				</View>
			</View>
		</Card>
	);
}
