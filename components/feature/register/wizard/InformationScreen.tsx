import {
  Form,
  FormCheckbox,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/Form";
import React from "react";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonGroup } from "@/components/ui/button";
import { cn, route } from "@/lib/utils";
import Feather from "@expo/vector-icons/Feather";
import { PersonalInfoSchema } from "@/schema/registration";
import { UseFormReturn } from "react-hook-form";
import { View } from "react-native";
import { router } from "expo-router";

function CriteriaItem({
  label,
  met,
  isPrimary,
}: {
  label: string;
  met: boolean;
  isPrimary?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={cn(
          "size-4 items-center justify-center rounded-full",
          met ? "bg-green-500" : "bg-zinc-200",
        )}
      >
        {met && <Feather name="check" size={10} color="white" />}
      </View>
      <Text
        className={cn("text-xs", met ? "" : "text-zinc-500")}
        w={isPrimary ? "semibold" : "regular"}
      >
        {label} {isPrimary && <Text className="text-red-500">*</Text>}
      </Text>
    </View>
  );
}

export default function WizardInformationScreen(props: {
  form: UseFormReturn<PersonalInfoSchema>;
  handleContinue: () => void;
}) {
  const { form, handleContinue } = props;

  const {
    formState: { errors },
    watch,
  } = form;

  const password = watch("password");

  const { strength, passwordCriteria } = React.useMemo(() => {
    const defaultCriteria = {
      length: false,
      mixedCase: false,
      numbers: false,
      special: false,
    };

    if (!password) return { strength: 0, passwordCriteria: defaultCriteria };

    const criteria = {
      length: password.length >= 10,
      mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    let score = 0;
    if (criteria.length) score = 1;
    if (criteria.length && criteria.mixedCase && criteria.numbers) score = 2;
    if (
      criteria.length &&
      criteria.mixedCase &&
      criteria.numbers &&
      criteria.special
    )
      score = 3;

    return { strength: score, passwordCriteria: criteria };
  }, [password]);

  return (
    <>
      <Wrapper hasActionButton avoidKeyboard>
        <View className="grow p-8">
          <View className="gap-4">
            <Text className="text-base" w="semibold">
              Masukkan data pemilik usaha
            </Text>
            <Text className="text-zinc-500">
              Email dan nomor HP akan digunakan untuk keperluan komunikasi
              selama proses pendaftaran, login ke Rápido, validasi rekening, dan
              lainnya.
            </Text>
          </View>

          <Form {...form}>
            <View className="mt-8 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={() => (
                  <FormItem>
                    <FormLabel>Nama Pemilik</FormLabel>
                    <FormControl>
                      <FormInput placeholder="Rahmanda Agisti" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={() => (
                  <FormItem>
                    <FormLabel>Email Pemilik</FormLabel>
                    <FormControl>
                      <FormInput placeholder="rahmanda@gmail.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={() => (
                  <FormItem>
                    <FormLabel>Nomor Telepon Pemilik</FormLabel>
                    <FormControl>
                      <FormInput placeholder="08114533276" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={() => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <FormInput
                        placeholder="Masukkan password"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                    {!!password && password.length > 0 && (
                      <View className="mt-2 gap-2">
                        <View className="flex-row gap-2">
                          {[1, 2, 3].map((level) => (
                            <View
                              key={level}
                              className={cn(
                                "h-1 flex-1 rounded-full",
                                strength >= level
                                  ? strength === 1
                                    ? "bg-red-500"
                                    : strength === 2
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  : "bg-zinc-200",
                              )}
                            />
                          ))}
                        </View>

                        <View className="mt-2 gap-1">
                          <View className="flex-col gap-1">
                            <CriteriaItem
                              label="10 Karakter"
                              met={passwordCriteria.length}
                              isPrimary
                            />
                            <CriteriaItem
                              label="Huruf Besar & Kecil"
                              met={passwordCriteria.mixedCase}
                            />
                            <CriteriaItem
                              label="Angka"
                              met={passwordCriteria.numbers}
                            />
                            <CriteriaItem
                              label="Simbol"
                              met={passwordCriteria.special}
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tnc"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormCheckbox
                        data={{ label: "Syarat & Ketentuan", value: "tnc" }}
                        href={route("/terms-and-condition")}
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

      <ButtonGroup className="absolute bottom-8 w-full px-8">
        <Button size="xl" onPress={handleContinue}>
          <Text className="text-base text-white" w="semibold">
            Lanjut
          </Text>
        </Button>
      </ButtonGroup>
    </>
  );
}
