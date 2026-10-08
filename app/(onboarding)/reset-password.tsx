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
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from "@/schema/reset-password";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";

export default function ResetPasswordScreen() {
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  function handleResetPassword(data: ResetPasswordSchema) {
    router.replace("/(back-office)/home");
  }

  return (
    <View className="grow bg-white p-8">
      <View className="gap-4">
        <Text w="semibold">Atur Ulang Password</Text>
        <Text className="text-sm text-muted">
          Sekarang kamu bisa atur ulang password baru untuk akun Rápido-mu!
        </Text>
      </View>

      <Form {...form}>
        <View className="mt-8 gap-6">
          <FormField
            control={form.control}
            name="password"
            render={() => (
              <FormItem>
                <FormLabel>Password Baru</FormLabel>
                <FormControl>
                  <FormInput
                    type="password"
                    placeholder="Masukkan password baru"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={() => (
              <FormItem>
                <FormLabel>Konfirmasi Password Baru</FormLabel>
                <FormControl>
                  <FormInput
                    type="password"
                    placeholder="Konfirmasi password baru"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </View>
      </Form>

      <View className="mt-auto">
        <ButtonGroup>
          <Button size="xl" onPress={form.handleSubmit(handleResetPassword)}>
            <ButtonText size="md">Konfirmasi</ButtonText>
          </Button>
        </ButtonGroup>
      </View>
    </View>
  );
}
