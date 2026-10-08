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
import { BANK_OPTIONS } from "@/constants/data/other/bank-types";
import { wait } from "@/lib/utils";
import {
  paymentMethodSchema,
  PaymentMethodSchema,
} from "@/schema/manage/payment-method";
import { PaymentMethodItemProps } from "@/types/ui/manage/payment-method";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

export default function PaymentMethodScreen() {
  const params = useLocalSearchParams();

  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethodItemProps | null>(null);

  const form = useForm({
    resolver: zodResolver(paymentMethodSchema),
  });

  const finishModal = useAlertModal();

  async function handleSubmit(data: PaymentMethodSchema) {
    // * Call api HERE
    await wait(2000);

    finishModal.open();
  }

  function handleModalClose() {
    finishModal.close();
    delayedBack();
  }

  React.useEffect(() => {
    if (params?.id) {
      // * Simulate fetching data from API
      const paymentMethod = PAYMENT_METHOD_ITEMS.find(
        (item) => item.id === params.id,
      );

      if (paymentMethod) {
        setPaymentMethod(paymentMethod);
        form.setValue("name", paymentMethod.name);
        form.setValue("type", paymentMethod.type);
        form.setValue("adminType", paymentMethod.adminType);
        form.setValue("value", paymentMethod.value);
        form.setValue("bank", paymentMethod.bank);
        form.setValue("accountNumber", paymentMethod.accountNumber);
        form.setValue("accountName", paymentMethod.accountName);
      } else {
        alert("Payment method not found");
        router.back();
      }
    }
  }, []);

  return (
    <>
      <SuccessModal
        title={`Metode Pembayaran Berhasil ${paymentMethod ? "Diubah" : "Ditambahkan"}!`}
        description="Kamu akan menambahkan metode pembayaran pada halaman daftar metode pembayaran."
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
                      <FormLabel>Nama Metode</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Transfer Bank"
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
                      <FormLabel>Jenis Pembayaran</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Transfer Bank"
                          data={[
                            {
                              label: "Transfer Bank",
                              value: "transfer",
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
                  name="adminType"
                  render={() => (
                    <FormItem>
                      <FormLabel>Biaya Admin</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Persentase"
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
                  name="value"
                  render={() => (
                    <FormItem>
                      <FormLabel>Nilai Biaya Admin</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="1%"
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
                  name="bank"
                  render={() => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="BCA%"
                          className="bg-zinc-100"
                          data={BANK_OPTIONS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={() => (
                    <FormItem>
                      <FormLabel>Nomor Rekening</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="1471xxxxx"
                          className="bg-zinc-100"
                          type="text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountName"
                  render={() => (
                    <FormItem>
                      <FormLabel>Nama Akun Rekening</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Chelsea Vioreen"
                          className="bg-zinc-100"
                          type="text"
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
