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
	SelectItemProps,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { BANK_OPTIONS } from "@/constants/data/other/bank-types";
import type { BankInfoSchema } from "@/schema/registration";

export default function BankInformationScreen({
	form,
	handleContinue,
}: {
	form: UseFormReturn<BankInfoSchema>;
	handleContinue: () => void;
}) {
	const {
		formState: { errors },
	} = form;

	return (
		<View className="flex-1">
			<Wrapper contentContainerStyle={{ padding: 32 }}>
				<View className="gap-4">
					<Text w="semibold">Masukkan data rekening-mu</Text>
					<Text className="text-xs text-muted">
						Lengkapi informasi rekening bank Anda untuk proses transaksi yang
						lancar. Pastikan data valid untuk menghindari pembayaran gagal.
					</Text>
				</View>

				<Form {...form}>
					<View className="mt-8 gap-6">
						<FormField
							control={form.control}
							name="bankName"
							render={() => (
								<FormItem>
									<FormLabel>Nama Bank</FormLabel>
									<FormControl>
										<FormSelect data={BANK_OPTIONS} placeholder="BCA" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="accountNumber"
							render={() => (
								<FormItem>
									<FormLabel>Nomor Rekening</FormLabel>
									<FormControl>
										<FormInput placeholder="1675400xxxxxx" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="accountName"
							render={() => (
								<FormItem>
									<FormLabel>Nama Pemilik Rekening</FormLabel>
									<FormControl>
										<FormInput placeholder="Rahmanda Agisti" />
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
