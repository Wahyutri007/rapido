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
	FormSelect,
} from "@/components/common/Form";
import Wrapper from "@/components/common/Wrapper";
import {
	type BusinessInfoSchema,
	businessInfoSchema,
} from "@/schema/manage/account";

const PROVINCE_OPTIONS = [
	{ label: "Riau", value: "Riau" },
	{ label: "DKI Jakarta", value: "DKI Jakarta" },
	{ label: "Jawa Barat", value: "Jawa Barat" },
	{ label: "Jawa Timur", value: "Jawa Timur" },
	{ label: "Sumatera Barat", value: "Sumatera Barat" },
	{ label: "Sumatera Utara", value: "Sumatera Utara" },
];

const CITY_OPTIONS = [
	{ label: "Pekanbaru", value: "Pekanbaru" },
	{ label: "Jakarta Selatan", value: "Jakarta Selatan" },
	{ label: "Jakarta Pusat", value: "Jakarta Pusat" },
	{ label: "Bandung", value: "Bandung" },
	{ label: "Surabaya", value: "Surabaya" },
	{ label: "Medan", value: "Medan" },
];

const DISTRICT_OPTIONS = [
	{ label: "Tampan", value: "Tampan" },
	{ label: "Pangean", value: "Pangean" },
	{ label: "Kebayoran Baru", value: "Kebayoran Baru" },
	{ label: "Coblong", value: "Coblong" },
	{ label: "Sukajadi", value: "Sukajadi" },
];

export default function ModifyBusinessInfoScreen() {
	const form = useForm<BusinessInfoSchema>({
		resolver: zodResolver(businessInfoSchema),
		defaultValues: {
			name: "Sushiro",
			address: "Jl. Oasis",
			province: "Riau",
			city: "Pekanbaru",
			district: "Tampan",
			postcode: "28282",
		},
	});

	function handleSubmit(_data: BusinessInfoSchema) {
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
										<FormLabel required>Nama Merchant</FormLabel>
										<FormControl>
											<FormInput placeholder="Masukkan nama pemilik" />
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
										<FormLabel required>Alamat Merchant</FormLabel>
										<FormControl>
											<FormInput placeholder="Masukkan email anda" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="province"
								render={() => (
									<FormItem>
										<FormLabel required>Provinsi</FormLabel>
										<FormControl>
											<FormSelect
												data={PROVINCE_OPTIONS}
												placeholder="Pilih Provinsi"
												label="Pilih Provinsi"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="city"
								render={() => (
									<FormItem>
										<FormLabel required>Kota</FormLabel>
										<FormControl>
											<FormSelect
												data={CITY_OPTIONS}
												placeholder="Pilih Kota"
												label="Pilih Kota"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="district"
								render={() => (
									<FormItem>
										<FormLabel required>Kecamatan</FormLabel>
										<FormControl>
											<FormSelect
												data={DISTRICT_OPTIONS}
												placeholder="Pilih Kecamatan"
												label="Pilih Kecamatan"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="postcode"
								render={() => (
									<FormItem>
										<FormLabel required>Kode Pos</FormLabel>
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
