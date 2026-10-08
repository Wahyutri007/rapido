import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import { duplicateName } from "@/lib/manage/place";
import { type PlaceAreasValues, placeAreasSchema } from "@/schema/manage/place";
import { usePlaceStore } from "@/store/placeStore";
import type { PlaceArea, PlaceOutlet } from "@/types/ui/manage/place";

export default function PlaceAreaForm({
	outletId = "",
	area,
}: {
	outletId?: string;
	area?: PlaceArea;
}) {
	const outlets = usePlaceStore((state) => state.outlets);
	const saveAreas = usePlaceStore((state) => state.saveAreas);
	const [success, setSuccess] = React.useState(false);
	const form = useForm<PlaceAreasValues>({
		resolver: zodResolver(placeAreasSchema),
		defaultValues: {
			outletId,
			rows: [{ areaId: area?.id ?? "", name: area?.name ?? "" }],
		},
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "rows",
	});
	const submit = (values: PlaceAreasValues) => {
		const outlet: PlaceOutlet | undefined = outlets.find(
			(item) => item.id === values.outletId,
		);
		if (!outlet) {
			form.setError("outletId", { message: "Toko/outlet tidak ditemukan." });
			return;
		}
		let duplicate = false;
		values.rows.forEach((row, index) => {
			if (duplicateName(outlet.areas, row.name, row.areaId)) {
				form.setError(`rows.${index}.name`, {
					message: "Nama area sudah digunakan di toko ini.",
				});
				duplicate = true;
			}
		});
		if (duplicate) return;
		const before = new Set(outlet.areas.map((item) => item.id));
		saveAreas(values);
		const created =
			usePlaceStore
				.getState()
				.outlets.find((item) => item.id === values.outletId)
				?.areas.filter((item) => !before.has(item.id)) ?? [];
		let next = 0;
		form.reset({
			...values,
			rows: values.rows.map((row) => ({
				...row,
				areaId: row.areaId || created[next++]?.id || "",
			})),
		});
		setSuccess(true);
	};
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Form {...form}>
						<FormField
							control={form.control}
							name="outletId"
							render={() => (
								<FormItem>
									<FormLabel required>Pilih Toko/Outlet</FormLabel>
									<FormControl>
										<FormSelect
											data={outlets.map((outlet) => ({
												value: outlet.id,
												label: outlet.name,
											}))}
											placeholder="Pilih toko/outlet"
											label="Pilih Toko/Outlet"
											disabled={
												!!outletId || fields.some((row) => !!row.areaId)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<View className="gap-4 rounded-lg border border-border-muted p-3">
							<Text size="normal" w="semibold">
								Nama Area
							</Text>
							{fields.map((field, index) => (
								<View key={field.id} className="flex-row items-start gap-2">
									<View className="flex-1">
										<FormField
											control={form.control}
											name={`rows.${index}.name`}
											render={() => (
												<FormItem>
													<FormLabel required>Nama Area {index + 1}</FormLabel>
													<FormControl>
														<FormInput
															placeholder="Contoh: Lantai 1 - Indoor"
															fieldProps={{
																"aria-label": `Nama Area ${index + 1}`,
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</View>
									{!area && (
										<Button
											variant="link"
											action="negative"
											isDisabled={fields.length === 1 || !!field.areaId}
											onPress={() => remove(index)}
											accessibilityLabel={`Hapus area ${index + 1}`}
										>
											<ButtonText>Hapus</ButtonText>
										</Button>
									)}
								</View>
							))}
							{!area && (
								<Button
									variant="outline"
									isDisabled={fields.length >= 30}
									onPress={() => append({ areaId: "", name: "" })}
								>
									<ButtonText>Tambah Area Lain</ButtonText>
								</Button>
							)}
						</View>
					</Form>
				</Card>
			</Wrapper>
			<BottomActionButton onPress={form.handleSubmit(submit)}>
				Simpan Area
			</BottomActionButton>
			<SuccessModal
				isOpen={success}
				onClose={() => setSuccess(false)}
				title="Area Disimpan"
				description="Area disimpan untuk pratinjau selama aplikasi terbuka."
				buttonText="Mengerti"
			/>
		</>
	);
}
