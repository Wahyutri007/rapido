import { useStoresQuery } from "@/api/hooks/stores";
import Text from "@/components/common/Text";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { ModalHeader } from "@/components/ui/modal";
import { useActiveStore } from "@/store/useActiveStore";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import { View } from "react-native";

export default function ChangeStoreButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  const { user } = useAuth();
  const { activeStoreId, setActiveStoreId } = useActiveStore();
  const storeQuery = useStoresQuery();

  const isOwner = user?.roles.includes("owner");

  // If not owner, don't show the change store button
  if (!isOwner) return null;

  return (
    <>
      <ButtonGroup className="flex-1">
        <Button
          action="secondary"
          variant="outline"
          onPress={() => setIsOpen(true)}
        >
          <ButtonText>Pindah Toko</ButtonText>
        </Button>
      </ButtonGroup>

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />

        <ActionsheetContent className="p-5">
          <ModalHeader>
            <Text className="text-center text-base" w="semibold">
              Pilih Toko
            </Text>
          </ModalHeader>
          <View className="mt-2 w-full items-start">
            {storeQuery.isLoading ? (
              <ActionsheetItem disabled>
                <ActionsheetItemText>Memuat...</ActionsheetItemText>
              </ActionsheetItem>
            ) : (
              storeQuery.data?.map((item) => (
                <ActionsheetItem
                  key={item.id}
                  onPress={() => {
                    setActiveStoreId(item.id);
                    setIsOpen(false);
                  }}
                  isSelected={activeStoreId === item.id}
                >
                  <ActionsheetItemText>{item.name}</ActionsheetItemText>
                </ActionsheetItem>
              ))
            )}
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
