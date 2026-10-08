import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import {
	Form,
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	EMPTY_SUPPLIER,
	SUPPLIER_REGIONS,
} from "@/constants/data/inventory-suppliers";
import { route } from "@/lib/utils";
import {
	type SupplierSchema,
	supplierSchema,
} from "@/schema/inventory/supplier";
import { useInventorySupplierStore } from "@/store/inventorySupplierStore";
import type { InventorySupplier } from "@/types/ui/inventory/supplier";
import { InventorySectionHeading } from "../InventoryUi";

const CONTACT_FIELDS = [
	{
		name: "name",
		label: "Nama Pemasok",
		placeholder: "Masukkan nama pemasok",
		keyboard: "default",
		maxLength: 80,
	},
	{
		name: "address",
		label: "Alamat",
		placeholder: "Masukkan alamat pemasok",
		keyboard: "default",
		maxLength: 500,
	},
	{
		name: "phone",
		label: "No. Telepon",
		placeholder: "Masukkan nomor telepon",
		keyboard: "phone-pad",
		maxLength: 24,
	},
	{
		name: "email",
		label: "Alamat Email",
		placeholder: "Masukkan alamat email",
		keyboard: "email-address",
		maxLength: 254,
	},
] as const;
const REGION_FIELDS = [
	{ name: "province", label: "Provinsi", placeholder: "Pilih provinsi" },
	{ name: "city", label: "Kota", placeholder: "Pilih kota" },
	{ name: "district", label: "Kecamatan", placeholder: "Pilih kecamatan" },
] as const;

function SupplierForm({ supplier }: { supplier?: InventorySupplier }) {
	const saveSupplier = useInventorySupplierStore((state) => state.saveSupplier);
	const [savedId, setSavedId] = React.useState<string>();
	const form = useForm<SupplierSchema>({
		resolver: zodResolver(supplierSchema),
		defaultValues: supplier ?? EMPTY_SUPPLIER,
	});
	const province = useWatch({ control: form.control, name: "province" });
	const city = useWatch({ control: form.control, name: "city" });
	const district = useWatch({ control: form.control, name: "district" });
	const regionValues = { province, city, district };
	function regionOptions(key: "province" | "city" | "district") {
		const regions = SUPPLIER_REGIONS.filter(
			(region) =>
				key === "province" ||
				(region.province === province &&
					(key === "city" || region.city === city)),
		);
		return [
			...new Set(
				[...regions.map((region) => region[key]), regionValues[key]].filter(
					Boolean,
				),
			),
		].map((name) => ({ label: name, value: name }));
	}
	function save(values: SupplierSchema) {
		const result = saveSupplier(supplier?.id, values);
		if ("error" in result)
			form.setError(result.field ?? "root", { message: result.error });
		else setSavedId(result.id);
	}
	function finish() {
		if (!savedId) return;
		const destination = route("/inventory/suppliers/detail", { id: savedId });
		if (supplier) router.dismissTo(destination);
		else router.replace(destination);
	}
	return (
		<>
			<Form {...form}>
				<Wrapper
					hasActionButton
					contentContainerStyle={{ padding: 16, gap: 16 }}
				>
					<Card density="compact" className="gap-4">
						<InventorySectionHeading
							title="Informasi Pemasok"
							description="Lengkapi detail dari pemasok ini"
							icon="info"
						/>
						{CONTACT_FIELDS.map((input) => (
							<FormField
								key={input.name}
								name={input.name}
								control={form.control}
								render={() => (
									<FormItem>
										<FormLabel required>{input.label}</FormLabel>
										<FormControl>
											<FormInput
												placeholder={input.placeholder}
												multiline={input.name === "address"}
												fieldProps={{
													keyboardType: input.keyboard,
													maxLength: input.maxLength,
													autoCapitalize:
														input.name === "email" ? "none" : "sentences",
													autoCorrect:
														input.name !== "email" && input.name !== "phone",
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
						{REGION_FIELDS.map((input) => (
							<FormField
								key={input.name}
								name={input.name}
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel required>{input.label}</FormLabel>
										<FormControl>
											<SingleSelect
												searchable
												label={input.label}
												placeholder={input.placeholder}
												value={field.value}
												items={regionOptions(input.name)}
												disabled={
													(input.name === "city" && !province) ||
													(input.name === "district" && !city)
												}
												onValueChange={(value) => {
													if (value === field.value) return;
													field.onChange(value);
													if (input.name === "province")
														form.setValue("city", "", { shouldValidate: true });
													if (input.name !== "district")
														form.setValue("district", "", {
															shouldValidate: true,
														});
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
						<FormField
							name="postalCode"
							control={form.control}
							render={() => (
								<FormItem>
									<FormLabel>Kode Pos</FormLabel>
									<FormControl>
										<FormInput
											placeholder="Masukkan kode pos"
											fieldProps={{ keyboardType: "number-pad", maxLength: 5 }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.formState.errors.root?.message && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.root.message}
							</Text>
						)}
					</Card>
				</Wrapper>
			</Form>
			<BottomActionButton onPress={form.handleSubmit(save)}>
				Simpan
			</BottomActionButton>
			<SuccessModal
				isOpen={Boolean(savedId)}
				title={`Pemasok Berhasil ${supplier ? "Diperbarui" : "Ditambahkan"}`}
				onClose={finish}
				onButtonPress={finish}
				buttonText="Lihat Detail"
			/>
		</>
	);
}

export default function SupplierFormScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const supplier = useInventorySupplierStore((state) =>
		state.suppliers.find((item) => item.id === id),
	);
	if (id && !supplier)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Pemasok tidak ditemukan" />
			</Wrapper>
		);
	return <SupplierForm key={id ?? "new"} supplier={supplier} />;
}
