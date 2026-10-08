// ! UNUSED COMPONENT
// ! This component is still in development and cannot be used in the app yet.

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
import {
  FieldValues,
  Path,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";
import { View } from "react-native";

type StoreActionConfirmationProps<T extends FieldValues> = {
  onConfirm: () => void;
  openState: State<boolean>;
  form: UseFormReturn<T>;
  fields: {
    label: string;
    name: Path<T>;
  }[];
};

function FormItem<T extends FieldValues>({ title }: { title?: string }) {
  const { watch } = useFormContext<T>();
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

export default function DataConfirmationAction<T extends FieldValues>(
  props: StoreActionConfirmationProps<T>,
) {
  const { onConfirm, openState, form, fields } = props;

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
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={() => <FormItem title={field.label} />}
              />
            ))}
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
