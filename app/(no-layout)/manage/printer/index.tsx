import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import EditableActions from "@/components/feature/add/ActionButtons";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { PRINTER_ITEMS } from "@/constants/data/other/printer";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";

function PrinterItem(props: (typeof PRINTER_ITEMS)[number]) {
  const { id, name, description } = props;

  const deleteModal = useAlertModal();
  const deleteConfirmModal = useAlertModal();

  function handlePress() {
    // * For when press feature is needed
  }

  function handleEditPress() {
    router.push(`/manage/printer/modify?id=${id}`);
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
        title={`Apakah yakin ingin menghapus biaya tambahan '${name}'?`}
        description="Biaya tambahan akan hilang permanen jika kamu sudah mengkonfirmasi"
      />

      <SuccessModal
        title="Biaya Tambahan Berhasil Dihapus!"
        description="Biaya tambahan berhasil dihapus dari daftar biaya tambahan."
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
              <View className="justify-center">
                <Text className="text-sm text-gray-900" w="semibold">
                  {name}
                </Text>
                <Text className="mt-3 text-xs" w="medium">
                  {description}
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

export default function ExtraScreen() {
  function handleAddPress() {
    router.push("/manage/printer/modify");
  }

  return (
    <View className="grow bg-zinc-50 pb-8 pt-3">
      <FlatList
        data={PRINTER_ITEMS}
        style={{ height: 0 }}
        className="mb-8"
        renderItem={({ item }) => <PrinterItem {...item} />}
        ItemSeparatorComponent={() => <View className="h-2 bg-white" />}
        showsVerticalScrollIndicator={false}
      />

      <ButtonGroup className="mt-auto px-8">
        <Button size="xl" onPress={handleAddPress}>
          <ButtonText size="md">Tambah Printer</ButtonText>
        </Button>
      </ButtonGroup>
    </View>
  );
}
