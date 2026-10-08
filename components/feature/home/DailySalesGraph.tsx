import Text from "@/components/common/Text";
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
import { scrollArrayIndex } from "@/lib/utils";
import Entypo from "@expo/vector-icons/Entypo";
import React from "react";
import { View } from "react-native";
import { BarChart } from "react-native-chart-kit";

type DailySalesGraphProps = {
  title: string;
};

// TODO: make the graph the same as the one in the design
export default function DailySalesGraph(props: DailySalesGraphProps) {
  const { title } = props;

  const [graphContainerWidth, setGraphContainerWidth] =
    React.useState<number>(0);

  return (
    <View className="rounded-[20px] bg-white p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-900" w="semibold">
          {title}
        </Text>
        <Select>
          <SelectTrigger className="h-fit border-0 bg-transparent py-0">
            <SelectInput
              placeholder="Pilih"
              defaultValue="daily"
              className="h-fit py-0 pr-1 text-xs text-muted"
            />
            <SelectIcon
              as={() => (
                <Entypo
                  name="chevron-small-down"
                  size={24}
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

              <SelectItem value="daily" label="Harian" />
              <SelectItem value="weekly" label="Mingguan" />
              <SelectItem value="monthly" label="Bulanan" />
              <SelectItem value="yearly" label="Tahunan" />
            </SelectContent>
          </SelectPortal>
        </Select>
      </View>
      <View
        className="mt-3"
        onLayout={(e) => setGraphContainerWidth(e.nativeEvent.layout.width)}
      >
        <BarChart
          data={{
            labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43, 50],
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              },
            ],
          }}
          width={graphContainerWidth} // from react-native
          height={196}
          yAxisLabel="Rp"
          yAxisSuffix="k"
          fromZero
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1, index = 0) => Colors.zinc[400],
            barRadius: 4,
          }}
        />
      </View>
    </View>
  );
}
