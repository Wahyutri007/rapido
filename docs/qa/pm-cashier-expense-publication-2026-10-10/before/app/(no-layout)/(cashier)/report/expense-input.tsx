import BottomActionButton from "@/components/common/BottomActionButton";
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
import Wrapper from "@/components/common/Wrapper";
import { tw } from "@/lib/utils";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";

export default function ExpenseInputScreen() {
  const form = useForm();

  return (
    <>
      <Wrapper py={tw(4)} className="bg-white">
        <View className="relative flex-1 px-4">
          <Form {...form}>
            <View className="gap-6">
              <FormField
                control={form.control}
                name="code"
                render={() => (
                  <FormItem>
                    <FormLabel>No. Referensi</FormLabel>
                    <FormControl>
                      <FormInput placeholder="CD000001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={() => (
                  <FormItem>
                    <FormLabel>Sumber Dana</FormLabel>
                    <FormControl>
                      <FormInput placeholder="Kas" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="store"
                render={() => (
                  <FormItem>
                    <FormLabel>Toko</FormLabel>
                    <FormControl>
                      <FormSelect
                        data={[
                          {
                            label: "A",
                            value: "a",
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
                name="amount"
                render={() => (
                  <FormItem>
                    <FormLabel>Nominal</FormLabel>
                    <FormControl>
                      <FormInput placeholder="Rp 10.000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={() => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <FormInput
                        placeholder="Contoh: Stok Harian"
                        className="h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </View>
          </Form>
        </View>
      </Wrapper>

      <BottomActionButton>Simpan</BottomActionButton>
    </>
  );
}
