import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import SuccessModal from "@/components/common/SuccessModal";
import { delayedBack } from "@/components/custom/JSStack";
import {
  Form,
  FormControl,
  FormDateTimePicker,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormSelect,
} from "@/components/common/Form";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { CATEGORY_ITEMS } from "@/constants/data/category";
import { DISCOUNT_ITEMS } from "@/constants/data/discount";
import { wait } from "@/lib/utils";
import { DiscountSchema, discountSchema } from "@/schema/offer/discount";
import { DiscountItemProps } from "@/types/ui/offer/dicount";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

export default function ModifyDiscountScreen() {
  const params = useLocalSearchParams();

  const [discount, setDiscount] = React.useState<DiscountItemProps | null>(
    null,
  );

  const form = useForm({
    resolver: zodResolver(discountSchema),
  });

  form.watch("name");

  const finishModal = useAlertModal();

  async function handleSubmit(data: DiscountSchema) {
    // * Call api HERE
    await wait(1000);

    finishModal.open();
  }

  function handleModalClose() {
    finishModal.close();
    delayedBack();
  }

  React.useEffect(() => {
    async function getPromoData() {
      if (params?.id) {
        // * Fetch promo data from API
        const fetchedDiscount = DISCOUNT_ITEMS.find(
          (item) => item.id === params.id,
        );

        if (fetchedDiscount) {
          setDiscount(fetchedDiscount);
          form.setValue("name", fetchedDiscount.name);
          form.setValue("code", fetchedDiscount.code);
          form.setValue("type", fetchedDiscount.type);
          form.setValue("amount", fetchedDiscount.amount);
          form.setValue("appliedProduct", fetchedDiscount.appliedProduct);
          form.setValue("appliedCategory", fetchedDiscount.appliedCategory);
          form.setValue(
            "minimumTransaction",
            fetchedDiscount.minimumTransaction,
          );
          form.setValue("maxDiscount", fetchedDiscount.maxDiscount);
          form.setValue(
            "discountPeriod.start",
            fetchedDiscount.discountPeriod.start,
          );
          form.setValue(
            "discountPeriod.end",
            fetchedDiscount.discountPeriod.end,
          );
          form.setValue("timePeriod.start", fetchedDiscount.timePeriod.start);
          form.setValue("timePeriod.end", fetchedDiscount.timePeriod.end);
        } else {
          alert("Discount not found");
          router.back();
        }
      }
    }

    getPromoData();
  }, [params?.id]);

  return (
    <>
      <SuccessModal
        title={`Diskon Berhasil ${discount ? "Diubah" : "Ditambahkan"}!`}
        description="Kamu akan menemukannya pada halaman daftar diskon."
        openState={finishModal.openState}
        onClose={handleModalClose}
        buttonText="Tutup"
      />

      <ScrollView className="grow bg-zinc-50 pb-8 pt-3">
        <View className="px-4 py-3">
          <View className="rounded-[20px] bg-white p-4">
            <Form {...form}>
              <View className="gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={() => (
                    <FormItem>
                      <FormLabel>Nama Diskon</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Diskon Akhir Tahun 30%"
                          className="bg-zinc-100"
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
                      <FormLabel>Kode Diskon</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="AKHIR25"
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
                      <FormLabel>Jenis Diskon</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Pilih Jenis Promo"
                          className="bg-zinc-100"
                          data={[
                            {
                              label: "Persentase",
                              value: "percentage",
                            },
                            {
                              label: "Nominal",
                              value: "nominal",
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
                  name="amount"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Nilai{" "}
                        {form.watch("type") === "nominal"
                          ? "Nominal"
                          : "Persentase"}
                      </FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder={
                            form.watch("type") === "nominal"
                              ? "Rp 50.000"
                              : "50%"
                          }
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
                  name="appliedProduct"
                  render={() => (
                    <FormItem>
                      <FormLabel>Produk Berlaku</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Pilih Produk Berlaku"
                          className="bg-zinc-100"
                          data={[
                            {
                              label: "Semua Produk",
                              value: "all",
                            },
                            {
                              label: "Produk Pilihan",
                              value: "product",
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
                  name="appliedCategory"
                  render={() => (
                    <FormItem>
                      <FormLabel>Kategori Berlaku</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Pilih Kategori Berlaku"
                          className="bg-zinc-100"
                          data={CATEGORY_ITEMS.map((item) => ({
                            label: item.name,
                            value: item.id,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumTransaction"
                  render={() => (
                    <FormItem>
                      <FormLabel>Minimum Transaksi</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Rp 100.000"
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
                  name="maxDiscount"
                  render={() => (
                    <FormItem>
                      <FormLabel>Maksimum Diskon</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Rp 50.000"
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
                  name="discountPeriod"
                  render={() => (
                    <FormItem>
                      <FormLabel>Periode Diskon</FormLabel>
                      <FormControl>
                        <FormDateTimePicker
                          asRange
                          placeholder="Pilih periode"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timePeriod"
                  render={() => (
                    <FormItem>
                      <FormLabel>Jam Berlaku</FormLabel>
                      <FormControl>
                        <FormDateTimePicker
                          asRange
                          type="time"
                          placeholder="Pilih jam berlaku"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </View>
            </Form>
          </View>
        </View>
        <ButtonGroup className="mt-auto px-8 pb-12">
          <Button size="xl" onPress={form.handleSubmit(handleSubmit)}>
            <ButtonText size="md">Simpan</ButtonText>
          </Button>
        </ButtonGroup>
      </ScrollView>
    </>
  );
}
