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
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { EXTRA_ITEMS } from "@/constants/data/manage/extra";
import { PAYMENT_METHOD_ITEMS } from "@/constants/data/manage/payment-method";
import { TAXES_ITEMS } from "@/constants/data/manage/tax";
import { BANK_OPTIONS } from "@/constants/data/other/bank-types";
import { CALCULATION_TYPE_OPTIONS } from "@/constants/data/other/calculation-type";
import { EXTRA_OPTIONS } from "@/constants/data/other/extra";
import { wait } from "@/lib/utils";
import { ExtraSchema, extraSchema } from "@/schema/manage/extra";
import {
  paymentMethodSchema,
  PaymentMethodSchema,
} from "@/schema/manage/payment-method";
import { TaxSchema, taxSchema } from "@/schema/manage/tax";
import { ExtraItemProps } from "@/types/ui/manage/extra";
import { PaymentMethodItemProps } from "@/types/ui/manage/payment-method";
import { TaxItemProps } from "@/types/ui/manage/tax";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

export default function ExtraScreen() {
  const params = useLocalSearchParams();

  const [extraItem, setExtraItem] = React.useState<ExtraItemProps | null>(null);

  const form = useForm({
    resolver: zodResolver(extraSchema),
  });

  const finishModal = useAlertModal();

  async function handleSubmit(data: ExtraSchema) {
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
      const extra = EXTRA_ITEMS.find((item) => item.id === params.id);

      if (extra) {
        setExtraItem(extra);
        form.setValue("name", extra.name);
        form.setValue("type", extra.type);
        form.setValue("percentage", extra.percentage);
        form.setValue("calculationType", extra.calculationType);
      } else {
        alert("Tax item not found");
        router.back();
      }
    }
  }, []);

  return (
    <>
      <SuccessModal
        title={`Metode Biaya Berhasil ${extraItem ? "Diubah" : "Ditambahkan"}!`}
        description="Kamu akan menambahkan metode biaya pada halaman daftar metode biaya."
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
              <View className="gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={() => (
                    <FormItem>
                      <FormLabel>Nama Biaya</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Layanan"
                          className="bg-zinc-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={() => (
                    <FormItem>
                      <FormLabel>Jenis Biaya</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Layanan"
                          className="bg-zinc-100"
                          data={EXTRA_OPTIONS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calculationType"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tipe Perhitungan</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Persentase"
                          className="bg-zinc-100"
                          data={CALCULATION_TYPE_OPTIONS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="percentage"
                  render={() => (
                    <FormItem>
                      <FormLabel>Persentase</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="10%"
                          className="bg-zinc-100"
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
