import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { View } from "react-native";
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
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import type { PasswordInfoSchema } from "@/schema/registration";

export default function PasswordInformationScreen({
	form,
	handleContinue,
}: {
	form: UseFormReturn<PasswordInfoSchema>;
	handleContinue: () => void;
}) {
	const {
		formState: { errors },
	} = form;

	return (
		<View className="flex-1">
			<Wrapper contentContainerStyle={{ padding: 32 }}>
				<View className="gap-4">
					<Text w="semibold">Amankan akun POS bisnis-mu</Text>
					<Text className="text-xs text-muted">
						Buat password yang kuat untuk melindungi data dan transaksi tokomu.
					</Text>
				</View>

				<Form {...form}>
					<View className="mt-8 gap-6">
						<FormField
							control={form.control}
							name="password"
							render={() => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<FormInput placeholder="********" type="password" />
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
									<FormLabel>Konfirmasi Password</FormLabel>
									<FormControl>
										<FormInput placeholder="********" type="password" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</View>
				</Form>
			</Wrapper>

			<ButtonGroup className="px-8 pb-8">
				<Button size="xl" onPress={handleContinue}>
					<ButtonText size="md">Lanjut</ButtonText>
				</Button>
			</ButtonGroup>
		</View>
	);
}
