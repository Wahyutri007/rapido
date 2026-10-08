import Text from "@/components/common/Text";
import TransactionList from "@/components/feature/transactions/TransactionList";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Colors } from "@/constants/Colors";
import { TRANSACTION_ITEMS } from "@/constants/data/transaction/transaction";
import { TransactionItemProps } from "@/types/ui/transaction/transaction";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function UnpaidOrderScreen() {
  const [transactions, setTransactions] = React.useState<
    TransactionItemProps[] | null
  >(null);

  React.useEffect(() => {
    // Fetch transactions from API or local storage

    async function fetchTransactions() {
      const data = TRANSACTION_ITEMS;

      setTransactions(data.filter((item) => !item.statuses.isPaid));
    }

    fetchTransactions();
  }, []);

  const pendingTransactions = React.useMemo(
    () => transactions?.filter((item) => !item.statuses.isFinished),
    [transactions],
  );

  return (
    <View className="mt-10 grow bg-gray-50">
      <View className="flex-row items-center justify-between px-5 pt-5">
        <View className="flex-row items-center gap-1.5">
          <Pressable className="size-6 items-center justify-center rounded-full bg-error-100">
            <FontAwesome5 name="bell" size={12} color={Colors.neutral} />
          </Pressable>
          <Text className="text-xs text-error-400">
            {pendingTransactions?.length} pesanan masih dalam proses
          </Text>
        </View>
        <Select>
          <SelectTrigger className="h-fit border-0 bg-transparent py-0">
            <SelectInput
              placeholder="Semua"
              defaultValue="all"
              className="h-fit py-0 pr-1 text-muted"
              size="sm"
            />
            <SelectIcon
              as={() => (
                <Entypo
                  name="chevron-small-down"
                  size={16}
                  color={Colors.zinc[400]}
                />
              )}
            />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>

              <SelectItem value="semua" label="Semua" />
              <SelectItem value="processed" label="Selesai" />
              <SelectItem value="pending" label="Diproses" />
            </SelectContent>
          </SelectPortal>
        </Select>
      </View>
      <TransactionList data={transactions} />
    </View>
  );
}
