import { cn } from "@/lib/utils";
import React from "react";
import { View } from "react-native";

export default function Separator(props: React.ComponentProps<typeof View>) {
  const { className, ...rest } = props;

  return <View className={cn("h-px bg-border", className)} {...rest} />;
}
