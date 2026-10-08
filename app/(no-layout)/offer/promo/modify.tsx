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
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  ButtonText,
} from "@/components/ui/button";
import { CATEGORY_ITEMS } from "@/constants/data/category";
import { MENU_ITEMS } from "@/constants/data/menu";
import { PROMO_ITEMS } from "@/constants/data/promo";
import { wait } from "@/lib/utils";
import { PromoSchema, promoSchema } from "@/schema/offer/promo";
import { State } from "@/types";
import { MenuItemProps } from "@/types/ui/add/menu";
import { PromoItemProps } from "@/types/ui/offer/promo";
import { EEntypo as Entypo } from "@/components/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { ScrollView, View } from "react-native";

function PromoProductForm(props: {
  form: UseFormReturn<PromoSchema>;
  promoState: State<PromoItemProps | null>;
}) {
  const params = useLocalSearchParams();

  const { form, promoState } = props;

  const {
    formState: { errors },
  } = form;

  const [promo, setPromo] = promoState;
  const [fieldAmount, setFieldAmount] = React.useState(0);

  const [products, setProducts] = React.useState<MenuItemProps[] | null>(null);

  React.useEffect(() => {
    const fetchProducts = async () => {
      // Simulate an API call to fetch products
      setProducts(
        MENU_ITEMS.filter(
          (item) => item.category_id === form.watch("appliedCategory"),
        ),
      );
    };

    if (params?.id) {
      async function fetchPromo() {
        const fetchedPromo = PROMO_ITEMS.find((item) => item.id === params.id);

        if (fetchedPromo) {
          setPromo(fetchedPromo);
          form.setValue("name", fetchedPromo.name);
          form.setValue("code", fetchedPromo.code);
          form.setValue("type", fetchedPromo.type);
          form.setValue("appliedProduct", fetchedPromo.appliedProduct);
          form.setValue("appliedCategory", fetchedPromo.appliedCategory);
          form.setValue("minimumTransaction", fetchedPromo.minimumTransaction);
          form.setValue("maxDiscount", fetchedPromo.maxDiscount);
          form.setValue("discountPeriod", fetchedPromo.discountPeriod);
          form.setValue("timePeriod", fetchedPromo.timePeriod);

          setProducts(
            MENU_ITEMS.filter(
              (item) => item.category_id === fetchedPromo.appliedCategory,
            ),
          );
        } else {
          alert("Promo not found");
          router.back();
        }
      }

      fetchPromo();
    }

    fetchProducts();
  }, [form.watch("appliedCategory")]);

  React.useEffect(() => {
    form.setValue("promoProducts", [
      {
        product: "",
        amount: 0,
      },
    ]);

    setFieldAmount(1);
  }, []);

  function addVariant() {
    setFieldAmount((prev) => prev + 1);

    form.setValue("promoProducts", [
      ...form.getValues("promoProducts"),
      {
        product: "",
        amount: 0,
      },
    ]);
  }

  function removeVariant() {
    if (fieldAmount <= 1) return;

    setFieldAmount((prev) => prev - 1);
    form.setValue(
      "promoProducts",
      form.getValues("promoProducts").slice(0, -1),
    );
  }

  const productValid =
    errors.promoProducts?.every?.(
      (product) => product?.product === undefined,
    ) ?? true;

  const productError = errors.promoProducts
    ?.map?.((product) => product?.product?.message)
    .find((error) => error !== undefined);

  const amountValid =
    errors.promoProducts?.every?.((product) => product?.amount === undefined) ??
    true;

  const amountError = errors.promoProducts
    ?.map?.((product) => product?.amount?.message)
    .find((error) => error !== undefined);

  React.useEffect(() => {
    if (promo) setFieldAmount(promo.promoProducts.length);
  }, [promo]);

  return (
    <View>
      <View>
        <View className="flex-row gap-3">
          <View className="gap-2.5" style={{ flex: 2 }}>
            {Array.from({ length: fieldAmount }).map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`promoProducts.${index}.product`}
                render={() => (
                  <FormItem>
                    {index === 0 && <FormLabel>Pilihan Produk</FormLabel>}
                    <FormControl>
                      <FormSelect
                        placeholder="Pilih Produk"
                        className="bg-zinc-100"
                        data={
                          products?.map((item) => ({
                            label: item.name,
                            value: item.id,
                          })) ?? []
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </View>
          <View className="gap-2.5" style={{ flex: 1 }}>
            {Array.from({ length: fieldAmount }).map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`promoProducts.${index}.amount`}
                render={() => (
                  <FormItem>
                    {index === 0 && <FormLabel>Jumlah Produk</FormLabel>}
                    <FormControl>
                      <FormInput
                        placeholder="0"
                        className="bg-zinc-100"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </View>
        </View>
      </View>
      <View className="mt-3 flex-row justify-end gap-2">
        {fieldAmount > 1 && (
          <ButtonGroup>
            <Button className="aspect-square p-0" onPress={removeVariant}>
              <ButtonIcon
                as={(props: any) => <Entypo name="minus" size={16} {...props} />}
              />
            </Button>
          </ButtonGroup>
        )}
        <ButtonGroup>
          <Button className="aspect-square p-0" onPress={addVariant}>
            <ButtonIcon
              as={Entypo}
              name="plus"
            />
          </Button>
        </ButtonGroup>
      </View>
    </View>
  );
}

export default function ModifyPromoScreen() {
  const params = useLocalSearchParams();

  const [promo, setPromo] = React.useState<PromoItemProps | null>(null);

  const form = useForm({
    resolver: zodResolver(promoSchema),
  });

  const finishModal = useAlertModal();

  async function handleSubmit(data: PromoSchema) {
    // * Call api HERE
    await wait(1000);

    finishModal.open();
  }

  function handleModalClose() {
    finishModal.close();
    delayedBack();
  }

  // React.useEffect(() => {
  //   if (params?.id) {
  //     const fetchedVariant = VARIANT_ITEMS.find(
  //       (item) => item.id === params.id,
  //     );

  //     if (fetchedVariant) {
  //       setVariant(fetchedVariant);
  //       form.setValue("name", fetchedVariant.name);
  //       form.setValue("details", fetchedVariant.details);
  //     } else {
  //       alert("Unit not found");
  //       router.back();
  //     }
  //   }
  // }, [params?.id]);

  return (
    <>
      <SuccessModal
        title={`Promo Berhasil ${promo ? "Diubah" : "Ditambahkan"}!`}
        description="Kamu akan menemukannya pada halaman daftar promo."
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
                      <FormLabel>Nama Promo</FormLabel>
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
                      <FormLabel>Kode Promo</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="AKHIR30"
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
                      <FormLabel>Jenis Promo</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Pilih Jenis Promo"
                          className="bg-zinc-100"
                          data={[
                            {
                              label: "Diskon Persentase",
                              value: "percentage",
                            },
                            {
                              label: "Diskon Nominal",
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
                      <FormLabel>Kategori Produk Berlaku</FormLabel>
                      <FormControl>
                        <FormSelect
                          placeholder="Pilih Kategori Produk Berlaku"
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

                <PromoProductForm form={form} promoState={[promo, setPromo]} />

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
