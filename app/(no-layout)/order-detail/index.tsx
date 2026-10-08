import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import TransactionDetails from "@/components/common/TransactionDetails";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { TRANSACTION_ITEMS } from "@/constants/data/transaction/transaction";
import useCustomRouter from "@/hooks/useCustomRouter";
import { AlertActionProps, State } from "@/types";
import { TransactionItemProps } from "@/types/ui/transaction/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { z } from "zod";

const refundFormSchema = z.object({
  reason: z
    .string({
      required_error: "Alasan tidak boleh kosong",
    })
    .min(1, { message: "Alasan tidak boleh kosong" }),
});

function RefundFormAction({
  openState,
  transaction,
}: AlertActionProps & {
  transaction?: TransactionItemProps;
}) {
  const [open, setOpen] = openState;

  const form = useForm({
    resolver: zodResolver(refundFormSchema),
  });

  function onConfirm() {
    setOpen(false);
    router.push({
      pathname: "/order-detail/refund",
      params: {
        transactionId: transaction?.transactionId,
        reason: form.getValues("reason"),
      },
    });
  }

  return (
    <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
      <ActionsheetBackdrop />

      <ActionsheetContent className="items-start p-5">
        <Text className="text-gray-900" w="semibold">
          Konfirmasi Data Usaha
        </Text>
        <View className="mt-6 w-full gap-4">
          <Form {...form}>
            <FormField
              control={form.control}
              name="reason"
              render={() => (
                <FormItem>
                  <FormLabel>Alasan melakukan refund</FormLabel>
                  <FormControl>
                    <Textarea>
                      <TextareaInput
                        placeholder="..."
                        onChangeText={(text) => form.setValue("reason", text)}
                        value={form.watch("reason")}
                      />
                    </Textarea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </View>
        <View className="mt-8 w-full flex-row gap-4">
          {/* <ButtonGroup style={{ flex: 1 }}>
            <Button variant="outline" size="xl" onPress={() => setOpen(false)}>
              <ButtonText size="md">Perbaiki</ButtonText>
            </Button>
          </ButtonGroup> */}
          <ButtonGroup style={{ flex: 1 }}>
            <Button size="xl" onPress={form.handleSubmit(onConfirm)}>
              <ButtonText size="md">Lanjut</ButtonText>
            </Button>
          </ButtonGroup>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}

export default function TransactionDetailScreen() {
  const { params } = useCustomRouter();

  const [transaction, setTransaction] = React.useState<TransactionItemProps>();

  const refundAlert = useAlertModal();
  const refundFormAction = useAlertModal();

  React.useEffect(() => {
    // * Fetch here
    async function fetchTransaction() {
      const transactionData = TRANSACTION_ITEMS.find(
        (item) => item.transactionId === params.transactionId,
      );

      if (!transactionData) {
        alert("Pesanan tidak ditemukan");
        router.back();
        return;
      }

      setTransaction(transactionData);
    }

    fetchTransaction();
  }, []);

  function handleRefundPress() {
    refundAlert.close();
    refundFormAction.open();
  }

  return (
    <>
      <RefundFormAction
        transaction={transaction}
        openState={refundFormAction.openState}
      />

      <AlertModal
        title="Apakah yakin ingin melakukan proses refund "
        message="Pastikan apakah kamu benar ingin melakukan proses ini"
        cancelText="Batalkan"
        confirmText="Yakin, Refund"
        onConfirm={handleRefundPress}
        openState={refundAlert.openState}
      />

      <View className="grow bg-zinc-50">
        <ScrollView className="mt-5 grow bg-white py-5">
          <TransactionDetails transaction={transaction} type="history" />
        </ScrollView>
        <ButtonGroup className="mt-auto bg-white px-8 pb-8 pt-4">
          <Button size="xl" variant="outline" onPress={refundAlert.open}>
            <ButtonText size="md">Refund Pesanan</ButtonText>
          </Button>
        </ButtonGroup>
      </View>
    </>
  );
}
