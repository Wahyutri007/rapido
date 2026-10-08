import React from "react";
import { View } from "react-native";
import Text from "./Text";
import { cn } from "@/lib/utils";

function PinItem({
  value,
  secure = false,
}: {
  value: string | null;
  secure?: boolean;
}) {
  return (
    <View
      className={cn("items-center justify-center border-b border-gray-300", {
        "border-main-400": value !== null,
      })}
      style={{ aspectRatio: 3 / 4, flex: 1 }}
    >
      <Text className="text-[24px] text-gray-900" w="medium">
        {value && (secure ? "*" : value)}
      </Text>
    </View>
  );
}

export default function PinNumber(props: {
  value: number | string | null;
  length: number;
  secure?: boolean;
}) {
  const { value, length, secure } = props;

  const parsedValue = value?.toString();

  return (
    <View className="flex-row gap-3">
      {Array.from({ length }).map((_, index) => (
        <PinItem
          key={index}
          value={parsedValue?.[index] ?? null}
          secure={secure}
        />
      ))}
    </View>
  );
}
