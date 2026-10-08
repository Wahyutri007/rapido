import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function AccountingLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Akuntansi" /> }}
			/>
			<JSStack.Screen name="accounts" options={{ headerShown: false }} />
			<JSStack.Screen name="expenses" options={{ headerShown: false }} />
			<JSStack.Screen name="incomes" options={{ headerShown: false }} />
			<JSStack.Screen name="general-journal" options={{ headerShown: false }} />
			<JSStack.Screen
				name="adjusting-journal"
				options={{ headerShown: false }}
			/>
			<JSStack.Screen name="general-ledger" options={{ headerShown: false }} />
			<JSStack.Screen name="closing-journal" options={{ headerShown: false }} />
			<JSStack.Screen
				name="balance-sheet"
				options={{ header: () => <Header back title="Laporan" /> }}
			/>
			<JSStack.Screen
				name="profit-loss"
				options={{ header: () => <Header back title="Laporan" /> }}
			/>
			<JSStack.Screen
				name="capital-changes"
				options={{ header: () => <Header back title="Laporan" /> }}
			/>
			<JSStack.Screen name="cash-flow" options={{ headerShown: false }} />
		</JSStack>
	);
}
