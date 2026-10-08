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
import { VOUCHER_ITEMS } from "@/constants/data/voucher";
import { wait } from "@/lib/utils";
import { DiscountSchema, discountSchema } from "@/schema/offer/discount";
import { VoucherSchema, voucherSchema } from "@/schema/offer/voucher";
import { VoucherItemProps } from "@/types/ui/offer/voucher";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import Wrapper from "@/components/common/Wrapper";

export default function ModifyVoucherScreen() {
  const params = useLocalSearchParams();

  const [voucher, setVoucher] = React.useState<VoucherItemProps | null>(null);

  const form = useForm({
    resolver: zodResolver(voucherSchema),
  });

  const finishModal = useAlertModal();

  async function handleSubmit(data: VoucherSchema) {
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
        const fetchedVoucher = VOUCHER_ITEMS.find(
          (item) => item.id === params.id,
        );

        if (fetchedVoucher) {
          setVoucher(fetchedVoucher);
          form.setValue("name", fetchedVoucher.name);
          form.setValue("code", fetchedVoucher.code);
          form.setValue("type", fetchedVoucher.type);
          form.setValue("amount", fetchedVoucher.amount);
          form.setValue("appliedProduct", fetchedVoucher.appliedProduct);
          form.setValue("appliedCategory", fetchedVoucher.appliedCategory);
          form.setValue(
            "minimumTransaction",
            fetchedVoucher.minimumTransaction,
          );
          form.setValue("maxDiscount", fetchedVoucher.maxDiscount);
          form.setValue(
            "discountPeriod.start",
            fetchedVoucher.discountPeriod.start,
          );
          form.setValue(
            "discountPeriod.end",
            fetchedVoucher.discountPeriod.end,
          );
          form.setValue("timePeriod.start", fetchedVoucher.timePeriod.start);
          form.setValue("timePeriod.end", fetchedVoucher.timePeriod.end);
          form.setValue("target", fetchedVoucher.target);
        } else {
          alert("Voucher not found");
          router.back();
        }
      }
    }

    getPromoData();
  }, [params?.id]);

  return (
    <>
      <SuccessModal
        title={`Voucher Berhasil ${voucher ? "Diubah" : "Ditambahkan"}!`}
        description="Kamu akan menemukannya pada halaman daftar voucher."
        openState={finishModal.openState}
        onClose={handleModalClose}
        buttonText="Tutup"
      />

      <Wrapper hasBottomBar>
        <View className="px-4">
          <View className="rounded-[20px] bg-white p-4">
            <Form {...form}>
              <View className="gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={() => (
                    <FormItem>
                      <FormLabel>Nama Voucher</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Voucher Akhir Tahun 30%"
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
                      <FormLabel>Kode Voucher</FormLabel>
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
                      <FormLabel>Jenis Voucher</FormLabel>
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

                <FormField
                  control={form.control}
                  name="target"
                  render={() => (
                    <FormItem>
                      <FormLabel>Target Penerima</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Pilih Kategori Berlaku"
                          className="bg-zinc-100"
                          data={[
                            {
                              label: "Semua Pelanggan",
                              value: "all",
                            },
                            {
                              label: "Pelanggan Baru",
                              value: "new",
                            },
                            {
                              label: "Pelanggan Setia",
                              value: "loyal",
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
        </View>
        <ButtonGroup className="mt-auto px-8 pb-12">
          <Button size="xl" onPress={form.handleSubmit(handleSubmit)}>
            <ButtonText size="md">Simpan</ButtonText>
          </Button>
        </ButtonGroup>
      </Wrapper>
    </>
  );
}
