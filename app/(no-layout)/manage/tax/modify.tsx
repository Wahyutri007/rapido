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
import { PAYMENT_METHOD_ITEMS } from "@/constants/data/manage/payment-method";
import { TAXES_ITEMS } from "@/constants/data/manage/tax";
import { BANK_OPTIONS } from "@/constants/data/other/bank-types";
import { wait } from "@/lib/utils";
import {
  paymentMethodSchema,
  PaymentMethodSchema,
} from "@/schema/manage/payment-method";
import { TaxSchema, taxSchema } from "@/schema/manage/tax";
import { PaymentMethodItemProps } from "@/types/ui/manage/payment-method";
import { TaxItemProps } from "@/types/ui/manage/tax";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

export default function TaxScreen() {
  const params = useLocalSearchParams();

  const [taxItem, setTaxItem] = React.useState<TaxItemProps | null>(null);

  const form = useForm({
    resolver: zodResolver(taxSchema),
  });

  const finishModal = useAlertModal();

  async function handleSubmit(data: TaxSchema) {
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
      const tax = TAXES_ITEMS.find((item) => item.id === params.id);

      if (tax) {
        setTaxItem(tax);
        form.setValue("name", tax.name);
        form.setValue("type", tax.type);
        form.setValue("code", tax.code);
        form.setValue("percentage", tax.percentage);
        form.setValue("calculationType", tax.calculationType);
        form.setValue("roundingType", tax.roundingType);
      } else {
        alert("Tax item not found");
        router.back();
      }
    }
  }, []);

  return (
    <>
      <SuccessModal
        title={`Metode Pajak Berhasil ${taxItem ? "Diubah" : "Ditambahkan"}!`}
        description="Kamu akan menambahkan metode pajak pada halaman daftar metode pajak."
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
                      <FormLabel>Nama Pajak</FormLabel>
                      <FormControl>
                        <FormInput placeholder="PPN" className="bg-zinc-100" />
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
                      <FormLabel>Jenis Pajak</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="PPN"
                          className="bg-zinc-100"
                          data={[
                            {
                              label: "PPN",
                              value: "ppn",
                            },
                          ]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={() => (
                    <FormItem>
                      <FormLabel>Kode Pajak</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="VAT.01"
                          className="bg-zinc-100"
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
                <FormField
                  control={form.control}
                  name="calculationType"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tipe Kalkulasi</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Harga Produk Sudah Termasuk Pajak"
                          className="bg-zinc-100"
                          data={[
                            {
                              label: "Harga Produk Sudah Termasuk Pajak",
                              value: "included",
                            },
                            {
                              label: "Harga Produk Belum Termasuk Pajak",
                              value: "excluded",
                            },
                          ]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roundingType"
                  render={() => (
                    <FormItem>
                      <FormLabel>Pembulatan</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Tidak Dibulatkan"
                          className="bg-zinc-100"
                          data={[
                            {
                              label: "Tidak Dibulatkan",
                              value: "excluded",
                            },
                          ]}
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
