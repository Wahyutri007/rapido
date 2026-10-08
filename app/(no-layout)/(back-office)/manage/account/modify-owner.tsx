import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import {
	Form,
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import Wrapper from "@/components/common/Wrapper";
import { type OwnerInfoSchema, ownerInfoSchema } from "@/schema/manage/account";

export default function ModifyOwnerInfoScreen() {
	const form = useForm<OwnerInfoSchema>({
		resolver: zodResolver(ownerInfoSchema),
		defaultValues: {
			name: "Arianja",
			email: "Arianja8601@gmail.com",
			phone: "+628129483746",
			address: "Jl. Budaya, Jakarta Selatan",
			id_card_number: "28282",
		},
	});

	function handleSubmit(_data: OwnerInfoSchema) {
		router.back();
	}

	return (
		<>
			<Wrapper className="p-4" hasActionButton>
				<Card className="rounded-2xl p-4">
					<Form {...form}>
						<View className="gap-4">
							<FormField
								control={form.control}
								name="name"
								render={() => (
									<FormItem>
										<FormLabel required>Nama Pemilik</FormLabel>
										<FormControl>
											<FormInput placeholder="Masukkan nama pemilik" />
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
										<FormLabel required>Email</FormLabel>
										<FormControl>
											<FormInput placeholder="Masukkan email anda" />
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
										<FormLabel required>No.HP</FormLabel>
										<FormControl>
											<FormInput placeholder="Masukkan nomor hp" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="address"
								render={() => (
									<FormItem>
										<FormLabel required>Alamat</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Jl. Budaya, Jakarta Selatan"
												leftIcon={{ as: Feather, name: "map-pin" }}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="id_card_number"
								render={() => (
									<FormItem>
										<FormLabel required>ID Card</FormLabel>
										<FormControl>
											<FormInput placeholder="28282" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</View>
					</Form>
				</Card>
			</Wrapper>

			<BottomActionButton onPress={form.handleSubmit(handleSubmit)}>
				Simpan
			</BottomActionButton>
		</>
	);
}
