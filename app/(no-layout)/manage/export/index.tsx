import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormSelect,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import EditableActions from "@/components/feature/add/ActionButtons";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { STORE_ITEMS } from "@/constants/data/manage/store";
import { TAXES_ITEMS } from "@/constants/data/manage/tax";
import { BACKUP_ITEMS } from "@/constants/data/other/backup";
import useDayJS from "@/hooks/useDayJs";
import { cn } from "@/lib/utils";
import { ExportSelectSchema, exportSelectSchema } from "@/schema/manage/export";
import { BackupItemProps } from "@/types/ui/manage/backup";
import { TaxItemProps } from "@/types/ui/manage/tax";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { FlatList, Pressable, View } from "react-native";

export default function ExportScreen() {
  const form = useForm({
    resolver: zodResolver(exportSelectSchema),
  });

  function handleSubmit(data: ExportSelectSchema) {
    router.push({
      pathname: "/manage/export/modify",
      params: {
        store: data.store,
      },
    });
  }

  return (
    <View className="grow bg-zinc-50 pb-8 pt-8">
      <View className="px-8">
        <Form {...form}>
          <FormField
            control={form.control}
            name="store"
            render={() => (
              <FormItem>
                <FormLabel>Toko</FormLabel>
                <FormControl>
                  <FormSelect
                    placeholder="Pilih Toko"
                    className="bg-zinc-100"
                    data={STORE_ITEMS.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      </View>

      <ButtonGroup className="mt-auto px-8">
        <Button size="xl" onPress={form.handleSubmit(handleSubmit)}>
          <ButtonText size="md">Lanjut</ButtonText>
        </Button>
      </ButtonGroup>
    </View>
  );
}
