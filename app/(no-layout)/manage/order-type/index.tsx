import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import EditableActions from "@/components/feature/add/ActionButtons";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { CATEGORY_ITEMS } from "@/constants/data/category";
import { ORDER_TYPE_ITEMS } from "@/constants/data/manage/order-type";
import { cn } from "@/lib/utils";
import { CategoryItemProps } from "@/types/ui/add/category";
import { OrderItemProps } from "@/types/ui/cart/order";
import { OrderTypeItemProps } from "@/types/ui/manage/order.type";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";

function OrderTypeItem(props: OrderTypeItemProps) {
  const { id, name } = props;

  const deleteModal = useAlertModal();
  const deleteConfirmModal = useAlertModal();

  function handlePress() {
    // * For when press feature is needed
  }

  function handleEditPress() {
    router.push(`/manage/order-type/modify?id=${id}`);
  }

  function handleDeletePress() {
    deleteModal.close();
    deleteConfirmModal.open();
  }

  return (
    <>
      <DeleteConfirmModal
        onConfirm={handleDeletePress}
        openState={deleteModal.openState}
        title={`Apakah yakin ingin menghapus tipe pesanan ${name}?`}
        description="Tipe pesanan akan hilang permanen jika kamu sudah mengkonfirmasi"
      />

      <SuccessModal
        title="Tipe Pesanan Berhasil Dihapus!"
        description="Tipe pesanan berhasil dihapus dari daftar tipe pesanan."
        onClose={deleteConfirmModal.close}
        openState={deleteConfirmModal.openState}
        buttonText="Tutup"
      />

      <Pressable onPress={handlePress}>
        {({ pressed }) => (
          <View
            className={cn(
              "flex-row items-center justify-between bg-white p-5",
              {
                "bg-gray-200 opacity-75": false, // * For when press feature is needed
              },
            )}
          >
            <View className="flex-row items-center gap-3">
              <View className="justify-center gap-2">
                <Text className="text-sm text-gray-900" w="semibold">
                  {name}
                </Text>
              </View>
            </View>
            <EditableActions
              onDelete={deleteModal.open}
              onEdit={handleEditPress}
            />
          </View>
        )}
      </Pressable>
    </>
  );
}

export default function OrderTypeScreen() {
  function handleAddPress() {
    router.push("/manage/order-type/modify");
  }

  return (
    <View className="grow bg-zinc-100 pb-8 pt-3">
      <FlatList
        data={ORDER_TYPE_ITEMS}
        style={{ height: 0 }}
        className="mb-8"
        renderItem={({ item }) => <OrderTypeItem {...item} />}
        ItemSeparatorComponent={() => <View className="h-2 bg-white" />}
        showsVerticalScrollIndicator={false}
      />

      <ButtonGroup className="mt-auto px-8">
        <Button size="xl" onPress={handleAddPress}>
          <ButtonText size="md">Tambah Tipe Pesanan</ButtonText>
        </Button>
      </ButtonGroup>
    </View>
  );
}
