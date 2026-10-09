import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import {
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
	FormSelect,
} from "@/components/common/Form";

import { type TaxSchema, taxSchema } from "@/schema/manage/tax";
import type { TaxItemProps } from "@/types/ui/manage/tax";
import ManagePreviewForm from "./ManagePreviewForm";

const TAX_TYPES = [{ label: "PPN", value: "ppn" }];
const CALCULATION_TYPES = [
	{ label: "Harga Produk Sudah Termasuk Pajak", value: "product_included" },
	{ label: "Harga Produk Belum Termasuk Pajak", value: "product_excluded" },
];
const ROUNDING_TYPES = [{ label: "Tidak Dibulatkan", value: "none" }];

export default function TaxModifyScreen({ item }: { item?: TaxItemProps }) {
	const form = useForm<TaxSchema>({
		resolver: zodResolver(taxSchema),
		defaultValues: {
			name: item?.name ?? "",
			type: item?.type ?? "",
			code: item?.code ?? "",
			percentage: item?.percentage ?? 0,
			calculationType: item?.calculationType ?? "",
			roundingType: item?.roundingType ?? "",
		},
	});

	return (
		<ManagePreviewForm form={form} title="Pajak">
			<View className="gap-4">
				<FormField
					control={form.control}
					name="name"
					render={() => (
						<FormItem>
							<FormLabel required>Nama Pajak</FormLabel>
							<FormControl>
								<FormInput placeholder="Contoh: PPN" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="type"
					render={() => (
						<FormItem>
							<FormLabel required>Jenis Pajak</FormLabel>
							<FormControl>
								<FormSelect placeholder="Pilih jenis pajak" data={TAX_TYPES} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="code"
					render={() => (
						<FormItem>
							<FormLabel required>Kode Pajak</FormLabel>
							<FormControl>
								<FormInput placeholder="Contoh: VAT.01" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="percentage"
					render={() => (
						<FormItem>
							<FormLabel required>Persentase</FormLabel>
							<FormControl>
								<FormInput placeholder="Masukkan persentase" type="number" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="calculationType"
					render={() => (
						<FormItem>
							<FormLabel required>Tipe Kalkulasi</FormLabel>
							<FormControl>
								<FormSelect
									placeholder="Pilih tipe kalkulasi"
									data={CALCULATION_TYPES}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="roundingType"
					render={() => (
						<FormItem>
							<FormLabel required>Pembulatan</FormLabel>
							<FormControl>
								<FormSelect
									placeholder="Pilih pembulatan"
									data={ROUNDING_TYPES}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</View>
		</ManagePreviewForm>
	);
}
