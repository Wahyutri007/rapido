import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { ScrollView, View } from "react-native";
import Text from "@/components/common/Text";
import TransactionDetails from "@/components/common/TransactionDetails";
import { TRANSACTION_ITEMS } from "@/constants/data/transaction/transaction";
import useCustomRouter from "@/hooks/useCustomRouter";
import useDayJS from "@/hooks/useDayJs";
import { formatRp } from "@/lib/utils";
import type { TransactionItemProps } from "@/types/ui/transaction/transaction";

export default function ConfirmScreen() {
	const { params } = useCustomRouter();

	const [transaction, setTransaction] = React.useState<TransactionItemProps>();

	React.useEffect(() => {
		// * Fetch here
		async function fetchOrder() {
			const orderData = TRANSACTION_ITEMS[0];

			setTransaction(orderData);
		}

		fetchOrder();
	}, []);

	return (
		<View className="grow bg-zinc-50">
			<ScrollView className="mt-5 grow bg-white py-5">
				<TransactionDetails transaction={transaction} />
			</ScrollView>
		</View>
	);
}
