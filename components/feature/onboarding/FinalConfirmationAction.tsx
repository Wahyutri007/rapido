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
import {
  BankInfoSchema,
  BusinessInfoSchema,
  PasswordInfoSchema,
  PersonalInfoSchema,
} from "@/schema/registration";
import { State } from "@/types";
import React from "react";
import { useFormContext, UseFormReturn } from "react-hook-form";
import { View } from "react-native";

type FinalConfirmationActionProps = {
  onConfirm: () => void;
  openState: State<boolean>;
  forms: {
    personalInfo: UseFormReturn<PersonalInfoSchema>;
    bankInfo: UseFormReturn<BankInfoSchema>;
    passwordInfo: UseFormReturn<PasswordInfoSchema>;
  };
};

function FormItem(props: React.PropsWithChildren<{ title?: string }>) {
  const { title, children } = props;

  const { watch } = useFormContext<
    PersonalInfoSchema & BankInfoSchema & PasswordInfoSchema
  >();
  const { name } = useFormField();

  const value = watch(name as any);

  return (
    <View className="gap-0.5">
      <Text className="text-sm text-gray-900" w="medium">
        {title}
      </Text>
      <View className="rounded-lg bg-gray-50 p-2.5">
        <Text className="text-sm text-muted">
          {children ?? value ?? "-Tidak Diatur-"}
        </Text>
      </View>
    </View>
  );
}

export default function FinalConfirmationAction(
  props: FinalConfirmationActionProps,
) {
  const { onConfirm, openState, forms } = props;

  const [open, setOpen] = openState;

  return (
    <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
      <ActionsheetBackdrop />

      <ActionsheetContent className="items-start p-5">
        <Text className="text-gray-900" w="semibold">
          Konfirmasi Data Pendaftaran
        </Text>
        <View className="mt-6 w-full gap-4">
          <Form {...forms.personalInfo}>
            <FormField
              control={forms.personalInfo.control}
              name="name"
              render={() => <FormItem title="Nama Pemilik" />}
            />
            <FormField
              control={forms.personalInfo.control}
              name="email"
              render={() => <FormItem title="Email Pemilik" />}
            />
            <FormField
              control={forms.personalInfo.control}
              name="phone"
              render={() => <FormItem title="Nomor Telepon Pemilik" />}
            />
          </Form>
          <Form {...forms.bankInfo}>
            <FormField
              control={forms.bankInfo.control}
              name="bankName"
              render={() => <FormItem title="Nama Bank" />}
            />
            <FormField
              control={forms.bankInfo.control}
              name="accountNumber"
              render={() => <FormItem title="Nomor Rekening" />}
            />
            <FormField
              control={forms.bankInfo.control}
              name="accountName"
              render={() => <FormItem title="Nama Pemilik Rekening" />}
            />
          </Form>
          <Form {...forms.passwordInfo}>
            <FormField
              control={forms.passwordInfo.control}
              name="password"
              render={() => {
                const pass = forms.passwordInfo.getValues("password") || "";
                return (
                  <FormItem title="Password">
                    {Array.from({
                      length: pass.length,
                    }).map(() => "*")}
                  </FormItem>
                );
              }}
            />
          </Form>
        </View>
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
