import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import EditableActions from "@/components/feature/add/ActionButtons";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { DISCOUNT_ITEMS } from "@/constants/data/discount";
import { cn, formatRp } from "@/lib/utils";
import { DiscountItemProps } from "@/types/ui/offer/dicount";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";

function DiscountItem(data: DiscountItemProps) {
  const deleteModal = useAlertModal();
  const deleteConfirmModal = useAlertModal();

  function handlePress() {
    // * For when press feature is needed
  }

  async function handleEditPress() {
    router.push(`/offer/discount/modify?id=${data.id}`);
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
        title={`Apakah yakin ingin menghapus diskon '${data.name}'?`}
        description="Diskon akan hilang permanen jika kamu sudah mengkonfirmasi"
      />

      <SuccessModal
        title="Diskon Berhasil Dihapus!"
        description="Diskon berhasil dihapus dari daftar diskon."
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
            <View className="gap-2">
              <Text className="text-sm text-gray-900" w="semibold">
                {data.name}
              </Text>
              <View className="mt-2 gap-1">
                <Text className="text-xs text-muted" w="medium">
                  Min. Belanja {formatRp(data.minimumTransaction)}
                </Text>
                <Text className="text-xs text-muted" w="medium">
                  Diskon Hingga {formatRp(data.maxDiscount)}
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

export default function PromoScreen() {
  function handleAddPress() {
    router.push("/offer/discount/modify");
  }

  return (
    <View className="grow bg-zinc-50 pb-8 pt-3">
      <FlatList
        data={DISCOUNT_ITEMS}
        style={{ height: 0 }}
        className="mb-8"
        renderItem={({ item }) => <DiscountItem {...item} />}
        ItemSeparatorComponent={() => <View className="h-2 bg-white" />}
        showsVerticalScrollIndicator={false}
      />

      <ButtonGroup className="mt-auto px-8">
        <Button size="xl" onPress={handleAddPress}>
          <ButtonText size="md">Tambah Diskon</ButtonText>
        </Button>
      </ButtonGroup>
    </View>
  );
}
