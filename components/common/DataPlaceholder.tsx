import React from "react";
import { View } from "react-native";
import Text from "./Text";
import { cn } from "@/lib/utils";

type SearchNotFoundProps = {
  text?: string;
};

export function SearchNotFound(props: SearchNotFoundProps) {
  const { text = "Tidak ada hasil ditemukan" } = props;

  return (
    <View className="rounded-xl bg-white py-8">
      <Text className="text-center text-muted" size="normal" w="medium">
        {text}
      </Text>
    </View>
  );
}

export function LoadingPlaceholder(
  props: React.ComponentPropsWithoutRef<typeof View>,
) {
  const { className, ...rest } = props;

  return (
    <View className={cn("rounded-xl bg-white py-8", className)} {...rest}>
      <Text className="text-center text-muted" size="normal" w="medium">
        Loading...
      </Text>
    </View>
  );
}
