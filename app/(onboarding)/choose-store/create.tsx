import { useAlertModal } from "@/components/common/AlertModal";
import DataConfirmationAction from "@/components/common/DataConfirmationAction";
import LoadingAction, {
  useLoadingAction,
} from "@/components/common/LoadingAction";
import BusinessInformationScreen from "@/components/feature/register/wizard/BusinessInformationScreen";
import { wait } from "@/lib/utils";
import { BusinessInfoSchema, businessInfoSchema } from "@/schema/registration";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";

export default function CreateStoreScreen() {
  const form = useForm({
    resolver: zodResolver(businessInfoSchema),
  });

  const businessInfoAction = useAlertModal();

  const loadingAction = useLoadingAction({
    loadingMessage: "Membuat Toko...",
    successMessage: "Toko Berhasil Dibuat",
  });

  function handleContinue(data: BusinessInfoSchema) {
    businessInfoAction.open();
  }

  function handleConfirm() {
    businessInfoAction.close();
    loadingAction.load(async () => {
      // * Register here
      await wait(1000);
    });
  }

  function handleLoadingClose() {
    // * Simulate success
    router.replace("/choose-store?storeId=1");
  }

  return (
    <View className="flex-1 bg-white">
      <BusinessInformationScreen
        form={form}
        handleContinue={form.handleSubmit(handleContinue)}
      />

      <LoadingAction
        actionData={loadingAction.actionData}
        onClose={handleLoadingClose}
      />

      <DataConfirmationAction
        openState={businessInfoAction.openState}
        form={form}
        onConfirm={handleConfirm}
        fields={[
          {
            label: "Nama Usaha",
            name: "businessName",
          },
          {
            label: "Jenis Usaha",
            name: "businessType",
          },
          {
            label: "Kota Usaha",
            name: "businessCity",
          },
          {
            label: "Alamat Usaha",
            name: "businessAddress",
          },
          {
            label: "Email Usaha",
            name: "businessEmail",
          },
          {
            label: "Nomor Telepon Usaha",
            name: "businessPhone",
          },
        ]}
      />
    </View>
  );
}
