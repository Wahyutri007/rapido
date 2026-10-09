import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { formatRp, parseNumber, parseRp, wait } from "@/lib/utils";
import { router, useGlobalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function InputMoneyConfirm() {
  const params = useGlobalSearchParams();

  const orderAlert = useAlertModal();

  const totalPrice = parseNumber(params?.totalPrice as string);
  const value = parseNumber(params?.value as string);
  const change = value - totalPrice;

  function handleEdit() {
    router.replace({
      pathname: "/cart/input-money",
      params: {
        totalPrice: params?.totalPrice,
        value: params?.value,
      },
    });
  }

  async function handleFinish() {
    // * API Here
    await wait(1000);

    orderAlert.open();
  }

  function handleAlertClose() {
    router.replace("/cart/confirm");
  }

  return (
    <>
      <AlertModal
        title="🚀 Pesanan Berhasil Dibuat"
        message="Ringkasan pesanan akan dialihkan ke halaman keranjang!"
        openState={orderAlert.openState}
        onClose={handleAlertClose}
        hideCancelButton
        hideConfirmButton
      />
      <View className="grow bg-white px-5 pb-8">
        <View className="flex-row items-center justify-between gap-2 py-5">
          <Text className="text-sm text-gray-900" w="semibold">
            Uang Diterima
          </Text>
          <Text className="text-xs text-muted">
            {parseRp(params?.value as string)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between gap-2 py-5">
          <Text className="text-sm text-gray-900" w="semibold">
            Kembalian
          </Text>
          <Text className="text-xs text-muted">{formatRp(change)}</Text>
        </View>
        <ButtonGroup flexDirection="row" className="mt-auto w-full">
          <Button
            size="xl"
            className="flex-1"
            variant="outline"
            onPress={handleEdit}
          >
            <ButtonText size="sm">Edit Uang Diterima</ButtonText>
          </Button>
          <Button size="xl" className="flex-1" onPress={handleFinish}>
            <ButtonText size="md">Transaksi Selesai</ButtonText>
          </Button>
        </ButtonGroup>
      </View>
    </>
  );
}
