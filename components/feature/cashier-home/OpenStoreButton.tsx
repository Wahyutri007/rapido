import {
  useLatestStoreShiftQuery,
  useOpenStoreShift,
} from "@/api/hooks/store-shift";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetHeader,
  ActionsheetHeaderTitle,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { ModalHeader } from "@/components/ui/modal";
import { Colors } from "@/constants/Colors";
import { tw } from "@/lib/utils";
import { Entypo } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

const schema = z.object({
  opening_cash: z.coerce
    .number({
      required_error: "Kas awal wajib diisi",
      invalid_type_error: "Kas awal harus berupa angka",
    })
    .min(0, "Kas awal harus lebih besar dari 0"),
});

type Schema = z.infer<typeof schema>;

export default function OpenStoreButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  const closeStoreModal = useAlertModal();

  const { call, isLoading } = useOpenStoreShift();
  const latestStoreShiftQuery = useLatestStoreShiftQuery();
  const queryClient = useQueryClient();

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      opening_cash: 0,
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<Schema> = async (data) => {
    let response, error;
    [response, error] = await call(data);

    if (response) {
      setIsOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["store-shift"] });
    }
  };

  const handleButtonClick = () => {
    if (latestStoreShiftQuery.isLoading) return;

    if (latestStoreShiftQuery.isSuccess) {
      closeStoreModal.open();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <ButtonGroup className="flex-1">
        <Button
          onPress={handleButtonClick}
          action={latestStoreShiftQuery.isSuccess ? "negative" : "primary"}
        >
          <ButtonText>
            {latestStoreShiftQuery.isLoading
              ? "Memuat..."
              : latestStoreShiftQuery.isSuccess
                ? "Tutup Toko"
                : "Buka Toko"}
          </ButtonText>
        </Button>
      </ButtonGroup>

      <AlertModal
        message="Pindahkan tagihan ke shift berikutnya?"
        openState={closeStoreModal.openState}
        onClose={closeStoreModal.close}
        onConfirm={() => {
          closeStoreModal.close();
          router.push("/shift-report");
        }}
        confirmAction="negative"
      >
        <Entypo
          name="warning"
          className="mx-auto py-2"
          size={tw(12)}
          color={Colors.red[500]}
        />
      </AlertModal>

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />

        <ActionsheetContent className="pb-10">
          <ActionsheetHeader>
            <ActionsheetHeaderTitle>Buka Toko</ActionsheetHeaderTitle>
          </ActionsheetHeader>

          <View className="w-full">
            <Form {...form}>
              <FormField
                control={form.control}
                name="opening_cash"
                render={() => (
                  <FormItem>
                    <FormLabel>Kas Awal</FormLabel>
                    <FormControl>
                      <FormInput
                        placeholder="Rp 200.000"
                        type="number"
                        id="opening_cash"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ButtonGroup className="mt-5" isDisabled={isLoading}>
                <Button size="lg" onPress={form.handleSubmit(onSubmit)}>
                  <ButtonText>Buka Toko</ButtonText>
                </Button>
              </ButtonGroup>
            </Form>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
