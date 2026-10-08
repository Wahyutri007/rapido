import { IMAGES } from "@/assets/images";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Text from "@/components/common/Text";
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  ButtonText,
} from "@/components/ui/button";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Colors } from "@/constants/Colors";
import useDayJS from "@/hooks/useDayJs";
import { useSecureStoreState } from "@/hooks/useSecureStore";
import { cn, parseRp, wait } from "@/lib/utils";
import { State } from "@/types";
import { B } from "@expo/html-elements";
import { EEntypo as Entypo } from "@/components/icons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React, { use } from "react";
import { ImageBackground, View } from "react-native";
import StoreSalesOverview from "./StoreSalesOverview";

// ! OBSOLETE: Remove
export default function StoreOverview() {
  // * Mock persistent data
  const [isStoreActive, setIsStoreActive] = useSecureStoreState(
    "storeOpen",
    false,
  );
  const [kasAwal, setKasAwal] = useSecureStoreState("kasAwal", "0");

  const openKasAlert = useAlertModal();
  const closeSummaryAlert = useAlertModal();
  const closeStoreAlert = useAlertModal();
  const closeStoreConfirmAlert = useAlertModal();

  const { formatDate } = useDayJS();

  function handleOpenPress() {
    openKasAlert.close();
    router.push("/home/input-kas");
  }

  function handleCloseSummaryPress() {
    closeSummaryAlert.close();
    closeStoreAlert.open();
  }

  async function handleClosePress() {
    // * Mock API call
    await wait(1000);
    setIsStoreActive(false);
    setKasAwal("0");

    closeStoreAlert.close();
    closeStoreConfirmAlert.open();
  }

  function handleCloseConfirmationPress() {
    closeStoreConfirmAlert.close();
  }

  return (
    <>
      {/* Fragment for alert dialogs fold */}
      <>
        <AlertModal
          openState={openKasAlert.openState}
          title="💰 Siapkan Kas Awal"
          message="Masukkan nominal uang kas awal untuk memulai transaksi hari ini"
          onConfirm={handleOpenPress}
          confirmText="Masukkan Uang Kas Awal"
          hideCancelButton
        />
        <AlertModal
          openState={closeSummaryAlert.openState}
          title="Ringkasan Penjualan Hari Ini"
          message={<StoreSalesOverview />}
          onConfirm={handleCloseSummaryPress}
          cancelText="Kembali"
          confirmText="Lanjut"
        />
        <AlertModal
          openState={closeStoreAlert.openState}
          title="Kamu yakin untuk menutup toko?"
          message="Masukkan nominal uang kas awal untuk memulai transaksi hari ini"
          confirmText="Yakin"
          cancelText="Kembali"
          onConfirm={handleClosePress}
        />
        <AlertModal
          openState={closeStoreConfirmAlert.openState}
          title="Toko Berhasil Ditutup!"
          message="Sampai bertemu di besok hari!"
          onClose={handleCloseConfirmationPress}
          hideCancelButton
          hideConfirmButton
        />
      </>

      <View className="relative overflow-hidden rounded-[20px]">
        <ImageBackground
          source={
            isStoreActive
              ? IMAGES.home_store_active
              : IMAGES.home_store_inactive
          }
          className="absolute size-full"
          resizeMethod="scale"
        />
        <View className="p-5">
          {/* Header */}
          <Text
            className={cn(
              "text-xs",
              isStoreActive ? "text-white" : "text-red-400",
            )}
            w="bold"
          >
            {isStoreActive ? "✅ Toko Aktif" : "🔴 Toko Non-Aktif"}
          </Text>
          {/* Header Text */}
          <View className="mt-2 flex-row items-center justify-between border-b border-gray-300 pb-1">
            <Text
              className={cn(
                "text-sm",
                isStoreActive ? "text-gray-50" : "",
              )}
              w="semibold"
            >
              Sushiro
            </Text>
            <View className="flex-row items-center gap-2">
              <Feather
                name="calendar"
                size={12}
                color={isStoreActive ? "white" : Colors.zinc[400]}
              />
              <Text
                className={cn(
                  "text-xs",
                  isStoreActive ? "text-gray-50" : "text-muted",
                )}
                w="medium"
              >
                {formatDate(new Date(), "dddd, DD MMMM YYYY")}
              </Text>
            </View>
          </View>
          {/* Content */}
          <View className="mt-6">
            <Text
              className={cn(
                "text-sm",
                isStoreActive ? "text-gray-50" : "",
              )}
              w="medium"
            >
              {isStoreActive
                ? `Kas Awal: ${parseRp(kasAwal)}`
                : "🔒 Shift belum dimulai."}
            </Text>
            <Text
              className={cn(
                "text-sm",
                isStoreActive ? "text-gray-50" : "",
              )}
              w="medium"
            >
              {isStoreActive
                ? `Total Transaksi: Rp ${(1550000).toLocaleString()}`
                : "Buka toko untuk memulai transaksi!"}
            </Text>
          </View>
          {/* Buttons */}
          <ButtonGroup className="mt-6 self-start">
            <Button
              action={isStoreActive ? "negative" : "primary"}
              size="xs"
              onPress={() =>
                isStoreActive ? closeSummaryAlert.open() : openKasAlert.open()
              }
            >
              <ButtonText>
                {isStoreActive ? "Tutup Toko" : "Buka Toko"}
              </ButtonText>
              {!isStoreActive && (
                <ButtonIcon
                  as={Entypo}
                  name="chevron-small-right"
                />
              )}
            </Button>
          </ButtonGroup>
        </View>
      </View>
    </>
  );
}
