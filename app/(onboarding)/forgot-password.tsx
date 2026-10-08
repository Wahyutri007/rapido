import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/Form"
import Text from "@/components/common/Text"
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button"
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal"
import { sendResetEmailSchema, SendResetEmailSchema } from "@/schema/reset-password"
import { State } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from "expo-router"
import React from "react"
import { useForm } from "react-hook-form"
import { View } from "react-native"

function ForgotPasswordDialog({ openState }: { openState: State<boolean> }) {
  const [open, setOpen] = openState;
  
  function handleClose() {
    setOpen(false);

    // * Replace to change password for development
    router.replace("/(onboarding)/reset-password");
    // router.replace("/login");
  }
  
  return (
    <Modal isOpen={open} onClose={handleClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Text className="text-lg" w="semibold">
            Email Terkirim
          </Text>
        </ModalHeader>
        <ModalBody>
          <Text className="text-sm text-muted">
            Kami sudah mengirimkan email untuk pengaturan ulang password ke
            alamat email yang kamu masukkan.
          </Text>
          <View className="mt-4" />
        </ModalBody>
        <ModalFooter>
          <ButtonGroup className="w-full">
            <Button size="xl" onPress={handleClose}>
              <ButtonText size="md">
                Kembali ke Login
              </ButtonText>
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function ForgotPasswordScreen() {
  const form = useForm<SendResetEmailSchema>({
    resolver: zodResolver(sendResetEmailSchema),
  });

  const [open, setOpen] = React.useState(false);

  function handleSendEmail() {
    setOpen(true);
  }

  return (
    <>
      <View className="grow bg-white p-8">
        <Text w="semibold">Lupa Password</Text>
        <Text className="mt-4 text-sm text-muted">
          Masukkan alamat email agar kami bisa mengirimkan link pengaturan ulang
          password-mu
        </Text>

        <Form {...form}>
          <View className="mt-8">
            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <FormInput placeholder="laspozasumkm@gmail.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </View>
        </Form>

        <View className="mt-auto">
          <ButtonGroup>
            <Button size="xl" onPress={form.handleSubmit(handleSendEmail)}>
              <ButtonText size="md">Kirim Email</ButtonText>
            </Button>
          </ButtonGroup>
        </View>
      </View>

      <ForgotPasswordDialog openState={[open, setOpen]} />
    </>
  );
}
