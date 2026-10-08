import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormSelect,
  SelectItemProps,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { BusinessInfoSchema } from "@/schema/registration";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ScrollView, View } from "react-native";

const BUSINESS_TYPES: SelectItemProps[] = [
  {
    value: "fnb",
    label: "FnB",
  },
  {
    value: "retail",
    label: "Retail",
  },
  {
    value: "service",
    label: "Service",
  },
  {
    value: "other",
    label: "Lainnya",
  },
];

const BUSINESS_CITIES: SelectItemProps[] = [
  {
    value: "jakarta",
    label: "Jakarta",
  },
  {
    value: "bandung",
    label: "Bandung",
  },
  {
    value: "surabaya",
    label: "Surabaya",
  },
  {
    value: "medan",
    label: "Medan",
  },
  {
    value: "makassar",
    label: "Makassar",
  },
];

type BusinessInformationScreenProps = {
  form: UseFormReturn<BusinessInfoSchema>;
  handleContinue: () => void;
  buttonText?: string;
};

export default function BusinessInformationScreen(
  props: BusinessInformationScreenProps,
) {
  const { form, handleContinue, buttonText = "Lanjut" } = props;

  const {
    formState: { errors },
  } = form;

  return (
    <View className="grow px-8 pb-8 pt-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mb-8"
        style={{ height: 0 }}
      >
        <View className="gap-4">
          <Text w="semibold">
            Masukkan data usaha-mu
          </Text>
          <Text className="text-xs text-muted">
            Email dan nomor HP akan digunakan untuk keperluan komunikasi selama
            proses pendaftaran, login ke Kojo, berinteraksi dengan pekerja,
            validasi rekening, dan lainnya.
          </Text>
        </View>

        <Form {...form}>
          <View className="mt-8 gap-6">
            <FormField
              control={form.control}
              name="businessName"
              render={() => (
                <FormItem>
                  <FormLabel>Nama Usaha</FormLabel>
                  <FormControl>
                    <FormInput placeholder="laspozas" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessType"
              render={() => (
                <FormItem>
                  <FormLabel>Jenis Usaha</FormLabel>
                  <FormControl>
                    <FormSelect data={BUSINESS_TYPES} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessCity"
              render={() => (
                <FormItem>
                  <FormLabel>Kota Usaha</FormLabel>
                  <FormControl>
                    <FormSelect data={BUSINESS_CITIES} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessAddress"
              render={() => (
                <FormItem>
                  <FormLabel>Alamat Usaha</FormLabel>
                  <FormControl>
                    <FormInput placeholder="Jl. Raya No. 123" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessEmail"
              render={() => (
                <FormItem>
                  <FormLabel>Email Usaha</FormLabel>
                  <FormControl>
                    <FormInput placeholder="laspozas@gmail.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessPhone"
              render={() => (
                <FormItem>
                  <FormLabel>Nomor Telepon Usaha</FormLabel>
                  <FormControl>
                    <FormInput placeholder="08114533276" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </View>
        </Form>
      </ScrollView>

      <ButtonGroup>
        <Button size="xl" onPress={handleContinue}>
          <ButtonText size="md">{buttonText}</ButtonText>
        </Button>
      </ButtonGroup>
    </View>
  );
}
