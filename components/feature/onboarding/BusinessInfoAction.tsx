import {
  Form,
  FormControl,
  FormField,
  useFormField,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { STORE_TYPE_OPTIONS } from "@/constants/data/other/store-type";
import { StoreSchema } from "@/schema/manage/store";
import { BusinessInfoSchema } from "@/schema/registration";
import { State } from "@/types";
import React from "react";
import { useFormContext, UseFormReturn } from "react-hook-form";
import { View } from "react-native";

type StoreActionConfirmationProps = {
  onConfirm: () => void;
  openState: State<boolean>;
  form: UseFormReturn<BusinessInfoSchema>;
};

function FormItem({ title }: { title?: string }) {
  const { watch } = useFormContext<BusinessInfoSchema>();
  const { name } = useFormField();

  const value = watch(name as any);

  return (
    <View className="gap-0.5">
      <Text className="text-sm text-gray-900" w="medium">
        {title}
      </Text>
      <View className="rounded-lg bg-gray-50 p-2.5">
        <Text className="text-sm text-muted">
          {value ?? "-Tidak Diatur-"}
        </Text>
      </View>
    </View>
  );
}

export default function BusinessInfoAction(
  props: StoreActionConfirmationProps,
) {
  const { onConfirm, openState, form } = props;

  const [open, setOpen] = openState;

  return (
    <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
      <ActionsheetBackdrop />

      <ActionsheetContent className="items-start p-5">
        <Text className="text-gray-900" w="semibold">
          Konfirmasi Data Usaha
        </Text>
        <Form {...form}>
          <View className="mt-6 w-full gap-4">
            <FormField
              control={form.control}
              name="businessName"
              render={() => <FormItem title="Nama Usaha" />}
            />
            <FormField
              control={form.control}
              name="businessType"
              render={() => <FormItem title="Jenis Usaha" />}
            />
            <FormField
              control={form.control}
              name="businessCity"
              render={() => <FormItem title="Kota Usaha" />}
            />
            <FormField
              control={form.control}
              name="businessAddress"
              render={() => <FormItem title="Alamat Usaha" />}
            />
            <FormField
              control={form.control}
              name="businessEmail"
              render={() => <FormItem title="Email Usaha" />}
            />
            <FormField
              control={form.control}
              name="businessPhone"
              render={() => <FormItem title="Nomor Telepon Usaha" />}
            />
          </View>
        </Form>
        <View className="mt-8 w-full flex-row gap-4">
          <ButtonGroup style={{ flex: 1 }}>
            <Button variant="outline" size="xl" onPress={() => setOpen(false)}>
              <ButtonText size="md">Perbaiki</ButtonText>
            </Button>
          </ButtonGroup>
          <ButtonGroup style={{ flex: 1 }}>
            <Button size="xl" onPress={onConfirm}>
              <ButtonText size="md">Konfirmasi</ButtonText>
            </Button>
          </ButtonGroup>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}
