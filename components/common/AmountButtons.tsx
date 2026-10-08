import React from "react";
import { View } from "react-native";
import { Button, ButtonGroup, ButtonIcon } from "../ui/button";
import { EEntypo as Entypo } from "@/components/icons";
import Text from "./Text";

type AmountButtonsProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function AmountButtons(props: AmountButtonsProps) {
  const { value, onDecrease, onIncrease } = props;

  return (
    <View className="mt-6 flex-row items-center justify-center gap-2">
      <ButtonGroup>
        <Button size="xs" className="aspect-square p-0" onPress={onDecrease}>
          <ButtonIcon as={Entypo} name="minus" />
        </Button>
      </ButtonGroup>
      <Text w="semibold">
        {value}
      </Text>
      <ButtonGroup>
        <Button size="xs" className="aspect-square p-0" onPress={onIncrease}>
          <ButtonIcon as={Entypo} name="plus" />
        </Button>
      </ButtonGroup>
    </View>
  );
}
