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
import { CALCULATION_TYPE_OPTIONS } from "@/constants/data/other/calculation-type";
import { EXTRA_OPTIONS } from "@/constants/data/other/extra";
import { type ExtraSchema, extraSchema } from "@/schema/manage/extra";
import type { ExtraItemProps } from "@/types/ui/manage/extra";
import ManagePreviewForm from "./ManagePreviewForm";

export default function ExtraModifyScreen({ item }: { item?: ExtraItemProps }) {
	const form = useForm<ExtraSchema>({
		resolver: zodResolver(extraSchema),
		defaultValues: {
			name: item?.name ?? "",
			type: item?.type ?? "",
			calculationType: item?.calculationType ?? "",
			percentage: item?.percentage ?? 0,
		},
	});

	return (
		<ManagePreviewForm form={form} title="Biaya Tambahan">
			<View className="gap-4">
				<FormField
					control={form.control}
					name="name"
					render={() => (
						<FormItem>
							<FormLabel required>Nama Biaya</FormLabel>
							<FormControl>
								<FormInput placeholder="Layanan" />
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
							<FormLabel required>Jenis Biaya</FormLabel>
							<FormControl>
								<FormSelect
									placeholder="Pilih jenis biaya"
									data={EXTRA_OPTIONS}
								/>
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
							<FormLabel required>Tipe Perhitungan</FormLabel>
							<FormControl>
								<FormSelect
									placeholder="Pilih tipe perhitungan"
									data={CALCULATION_TYPE_OPTIONS}
								/>
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
							<FormLabel required>Persentase / Nominal</FormLabel>
							<FormControl>
								<FormInput placeholder="Masukkan nilai" type="number" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</View>
		</ManagePreviewForm>
	);
}
