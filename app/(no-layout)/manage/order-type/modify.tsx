import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import SuccessModal from "@/components/common/SuccessModal";
import { delayedBack } from "@/components/custom/JSStack";
import {
  Form,
  FormControl,
  FormField,
  FormImageInput,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormSelect,
} from "@/components/common/Form";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { CATEGORY_ITEMS } from "@/constants/data/category";
import { ORDER_TYPE_ITEMS } from "@/constants/data/manage/order-type";
import { EXTRA_OPTIONS } from "@/constants/data/other/extra";
import { ORDER_TYPE_OPTIONS } from "@/constants/data/other/order-types";
import { wait } from "@/lib/utils";
import { CategorySchema, categorySchema } from "@/schema/add/category";
import { OrderTypeSchema, orderTypeSchema } from "@/schema/manage/order-type";
import { CategoryItemProps } from "@/types/ui/add/category";
import { OrderTypeItemProps } from "@/types/ui/manage/order.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";

export default function OrderTypeScreen() {
  const params = useLocalSearchParams();

  const [orderType, setOrderType] = React.useState<OrderTypeItemProps | null>(
    null,
  );

  const form = useForm<OrderTypeSchema>({
    resolver: zodResolver(orderTypeSchema),
  });

  const finishModal = useAlertModal();

  async function handleSubmit(data: OrderTypeSchema) {
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
      const fetchedCategory = ORDER_TYPE_ITEMS.find(
        (item) => item.id === params.id,
      );

      if (fetchedCategory) {
        setOrderType(fetchedCategory);
        form.setValue("name", fetchedCategory.name);
        form.setValue("type", fetchedCategory.type.value);
        form.setValue("extra", fetchedCategory.extra.value);
      } else {
        alert("Unit not found");
        router.back();
      }
    }
  }, []);

  return (
    <>
      <SuccessModal
        title={`Tipe Pesanan Berhasil ${orderType ? "Diubah" : "Ditambahkan"}!`}
        description="Kamu akan menemukannya pada halaman daftar kategori."
        openState={finishModal.openState}
        onClose={handleModalClose}
        buttonText="Tutup"
      />

      <View className="grow bg-zinc-100 pb-8 pt-3">
        <View className="px-4 py-3">
          <View className="rounded-[20px] bg-white p-4">
            <Form {...form}>
              <View className="gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={() => (
                    <FormItem>
                      <FormLabel>Nama Tipe Pesanan</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Makanan"
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
                      <FormLabel>Jenis Tipe Pesanan</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Pilih Kategori"
                          data={ORDER_TYPE_OPTIONS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="extra"
                  render={() => (
                    <FormItem>
                      <FormLabel>Biaya Tambahan</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Pilih Kategori"
                          data={EXTRA_OPTIONS}
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
        <ButtonGroup className="mt-auto px-8">
          <Button size="xl" onPress={form.handleSubmit(handleSubmit)}>
            <ButtonText size="md">Simpan</ButtonText>
          </Button>
        </ButtonGroup>
      </View>
    </>
  );
}
