import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import SuccessModal from "@/components/common/SuccessModal";
import { delayedBack } from "@/components/custom/JSStack";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormSelect,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { EXTRA_ITEMS } from "@/constants/data/manage/extra";
import { CALCULATION_TYPE_OPTIONS } from "@/constants/data/other/calculation-type";
import { EXTRA_OPTIONS } from "@/constants/data/other/extra";
import {
  DETECTED_PRINTERS,
  PRINTER_ITEMS,
} from "@/constants/data/other/printer";
import { wait } from "@/lib/utils";
import { ExtraSchema, extraSchema } from "@/schema/manage/extra";
import { ExtraItemProps } from "@/types/ui/manage/extra";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

export default function PrinterModifyScreen() {
  const params = useLocalSearchParams();

  const [printerItem, setPrinterItem] = React.useState<any | null>(null);

  const form = useForm();

  const finishModal = useAlertModal();

  async function handleSubmit(data: any) {
    // * Call api HERE
    await wait(1000);

    finishModal.open();
  }

  function handleModalClose() {
    finishModal.close();
    delayedBack();
  }

  React.useEffect(() => {
    if (params?.id) {
      // * Simulate fetching data from API
      const printer = PRINTER_ITEMS.find((item) => item.id === params.id);

      if (printer) {
        setPrinterItem(printer);
      } else {
        alert("Printer item not found");
        router.back();
      }
    }
  }, []);

  return (
    <>
      <SuccessModal
        title={`Printer Berhasil ${printerItem ? "Diubah" : "Ditambahkan"}!`}
        description="Kamu akan menambahkan printer pada halaman daftar printer."
        openState={finishModal.openState}
        onClose={handleModalClose}
        buttonText="Tutup"
      />

      <View className="grow bg-zinc-100 pb-5 pt-3">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="px-4 py-3"
          style={{ height: 0 }}
        >
          <View className="rounded-[20px] bg-white p-4">
            <Form {...form}>
              <View className="gap-5">
                <Text className="text-sm text-gray-900" w="semibold">
                  Printer Terdeteksi
                </Text>
                {DETECTED_PRINTERS.map((printer) => (
                  <View
                    key={printer.id}
                    className="flex-row items-center justify-between gap-2"
                  >
                    <Text>{printer.name}</Text>
                    <Text>{printer.method}</Text>
                  </View>
                ))}
              </View>
            </Form>
          </View>

          <View className="h-8" />
        </ScrollView>
        <ButtonGroup className="mt-auto px-5">
          <Button size="xl" onPress={form.handleSubmit(handleSubmit)}>
            <ButtonText size="md">Simpan</ButtonText>
          </Button>
        </ButtonGroup>
      </View>
    </>
  );
}
