import Text from "@/components/common/Text";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetHeader,
  ActionsheetHeaderTitle,
  ActionsheetItem,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { Colors } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Pressable, View } from "react-native";

type ActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
  name?: string;
  title?: string;
};

export default function EditableActions(
  props: React.PropsWithChildren<ActionButtonsProps>,
) {
  const { onEdit, onDelete, name, children, title } = props;

  const [open, setOpen] = React.useState(false);

  function handleEditPress() {
    setOpen(false);
    onEdit();
  }

  function handleDeletePress() {
    setOpen(false);
    onDelete();
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="size-6 items-center justify-center"
      >
        {children ?? (
          <Feather name="more-horizontal" size={20} color={Colors.zinc[400]} />
        )}
      </Pressable>

      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />

        <ActionsheetContent className="p-4">
          <ActionsheetHeader onClose={() => setOpen(false)}>
            <ActionsheetHeaderTitle>{title ?? "Aksi"}</ActionsheetHeaderTitle>
          </ActionsheetHeader>
          <View className="py-2">
            <ActionsheetItem
              onPress={handleEditPress}
              className="justify-between"
            >
              <Text w="medium">Edit {name}</Text>
              <Feather name="edit" size={20} color={Colors.zinc[700]} />
            </ActionsheetItem>
            <ActionsheetItem
              onPress={handleDeletePress}
              className="justify-between bg-red-100 data-[active=true]:bg-red-200"
            >
              <Text className="text-red-500" w="semibold">
                Hapus {name}
              </Text>
              <Feather name="trash-2" size={20} color={Colors.red[500]} />
            </ActionsheetItem>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
