import { useLogoutRequest } from "@/api/hooks/auth";
import { ILLUSTRATIONS } from "@/assets/images/illustrations";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import AppModeButton from "@/components/custom/AppModeButton";
import { Button, ButtonGroup } from "@/components/ui/button";
import { Constants } from "@/constants";
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React from "react";
import { ImageBackground, View } from "react-native";

export default function CashierHeader() {
  const logoutModal = useAlertModal();
  const logoutErrorModal = useAlertModal();
  const logoutRequest = useLogoutRequest();

  async function handleLogout() {
    const [response, error] = await logoutRequest.call();

    if (error) {
      logoutErrorModal.open();
      return;
    }

    logoutModal.close();
  }

  function handleNotificationPress() {
    alert("Notification Pressed");
  }

  return (
    <>
      <AlertModal
        title={"Apakah Anda yakin ingin keluar?"}
        message="Anda akan diarahkan ke halaman login."
        openState={logoutModal.openState}
        onClose={logoutModal.close}
        onConfirm={handleLogout}
        confirmText="Ya, Logout"
        cancelText="Batal"
        isLoading={logoutRequest.isLoading}
      />

      <AlertModal
        title="Gagal Logout"
        message="Terjadi kesalahan saat mencoba logout. Silakan coba lagi."
        openState={logoutErrorModal.openState}
        hideCancelButton
        confirmText="Tutup"
        onClose={logoutErrorModal.close}
      />

      <View className="h-64 overflow-hidden rounded-b-[32px]">
        <View style={{ height: Constants.statusBarHeight }} />
        <ImageBackground
          source={ILLUSTRATIONS.homeHeader}
          resizeMode="cover"
          className="absolute bottom-0 left-0 right-0 h-64"
        />
        <View className="w-fit flex-row justify-between p-5">
          <AppModeButton />
          <View className="flex-row">
            <ButtonGroup>
              <Button
                className="bg-white"
                size="iconMd"
                action="secondary"
                onPress={handleNotificationPress}
              >
                <MaterialIcons
                  name="notifications-none"
                  size={20}
                  color={Colors.neutral}
                />
              </Button>
            </ButtonGroup>
            <ButtonGroup className="ml-2">
              <Button
                className="bg-white"
                size="iconMd"
                action="secondary"
                onPress={() => logoutModal.open()}
              >
                <MaterialIcons name="logout" size={20} color={Colors.neutral} />
              </Button>
            </ButtonGroup>
          </View>
        </View>
      </View>
    </>
  );
}
