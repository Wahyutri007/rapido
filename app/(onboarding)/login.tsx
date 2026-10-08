import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Image, Pressable, View } from "react-native";
import useLoginRequest from "@/api/hooks/auth";
import { IMAGES } from "@/assets/images";
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
import Wrapper from "@/components/common/Wrapper";
import {
	AuthBackgroundImage,
	AuthContainer,
	KasikooLogo,
} from "@/components/feature/auth/shared";
import { EFeather } from "@/components/icons";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { type LoginSchema, loginSchema } from "@/schema/onboarding/login";
import type { State } from "@/types";

function RegisterAction({ state }: { state: State<boolean> }) {
	const router = useRouter();

	const [actionOpen, setActionOpen] = state;

	function handleRegister() {
		setActionOpen(false);

		router.push("/register");
	}

	return (
		<Actionsheet isOpen={actionOpen} onClose={() => setActionOpen(false)}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="items-start p-5">
				<ModalHeader>
					<Text className="text-[20px] text-gray-900" w="semibold">
						3 langkah daftarkan usaha-mu ke Rápido
					</Text>
				</ModalHeader>
				<ModalBody className="mt-8">
					<View className="gap-10">
						<View className="flex-row items-center gap-2">
							<Image
								source={IMAGES.step_1}
								className="aspect-square w-6"
								style={{ objectFit: "contain" }}
							/>
							<Text w="semibold">Isi data pemilik</Text>
						</View>
						<View className="flex-row items-center gap-2">
							<Image
								source={IMAGES.step_2}
								className="aspect-square w-6"
								style={{ objectFit: "contain" }}
							/>
							<Text w="semibold">Isi informasi rekening</Text>
						</View>
						<View className="flex-row items-center gap-2">
							<Image
								source={IMAGES.step_3}
								className="aspect-square w-6"
								style={{ objectFit: "contain" }}
							/>
							<Text w="semibold">Buat Password</Text>
						</View>
					</View>
				</ModalBody>
				<ModalFooter className="mt-8">
					<ButtonGroup className="w-full">
						<Button size="xl" onPress={handleRegister}>
							<ButtonText size="md">Daftar Sekarang</ButtonText>
						</Button>
					</ButtonGroup>
				</ModalFooter>
			</ActionsheetContent>
		</Actionsheet>
	);
}

export default function LoginScreen() {
	const router = useRouter();
	const form = useForm({
		resolver: zodResolver(loginSchema),
	});

	const loginRequest = useLoginRequest(form);

	const modalOpenState = React.useState(false);
	const [modalOpen, setModalOpen] = modalOpenState;

	async function handleLogin(data: LoginSchema) {
		if (loginRequest.isLoading) {
			return;
		}

		await loginRequest.call(data);
	}

	function handleForgotPassword() {
		router.push("/(onboarding)/forgot-password");
	}

	return (
		<View className="flex-1 bg-background">
			<Wrapper contentContainerStyle={{ paddingBottom: 32 }}>
				<View>
					<KasikooLogo />
					<AuthBackgroundImage />

					<AuthContainer>
						<Form {...form}>
							<View className="grow justify-center">
								<View>
									<Text className="text-center" w="bold">
										Masuk ke Akun{" "}
										<Text className="text-primary" w="bold">
											Kasikoo
										</Text>
									</Text>
									<Text className="text-center text-muted mt-2" size="small">
										Login untuk melanjutkan pengelolaan bisnis Anda.
									</Text>
								</View>

								<View className="mt-8 gap-6">
									<FormField
										control={form.control}
										name="email"
										render={() => (
											<FormItem>
												<FormLabel>Email / Nomor WhatsApp</FormLabel>
												<FormControl>
													<FormInput
														type="text"
														placeholder="laspozasumkm@gmail.com"
														id="email"
														leftIcon={{ as: EFeather, name: "mail" }}
													/>
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
														type="password"
														placeholder="*******"
														id="password"
														leftIcon={{ as: EFeather, name: "lock" }}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</View>

								<Pressable onPress={handleForgotPassword}>
									<Text className="ml-auto mt-2 text-xs" w="medium">
										Lupa password?
									</Text>
								</Pressable>

								<ButtonGroup className="mt-8">
									<Button
										size="xl"
										onPress={form.handleSubmit(handleLogin)}
										isDisabled={loginRequest.isLoading}
									>
										<Text className="text-base text-white" w="semibold">
											Masuk
										</Text>
									</Button>
								</ButtonGroup>

								<View className="mt-3 flex-row items-center justify-center">
									<Text className="text-xs text-muted">Belum punya akun?</Text>
									<Pressable onPress={() => setModalOpen(true)}>
										<Text className="ml-1 text-sm text-primary" w="semibold">
											Daftar Rápido
										</Text>
									</Pressable>
								</View>
							</View>
						</Form>
					</AuthContainer>
				</View>
			</Wrapper>

			<RegisterAction state={modalOpenState} />
		</View>
	);
}
