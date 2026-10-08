import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Platform, View } from "react-native";
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
import { Switch } from "@/components/ui/switch";
import { Colors } from "@/constants/Colors";
import { PLACE_KINDS } from "@/constants/data/manage/place";
import { duplicateName } from "@/lib/manage/place";
import { type PlacesValues, placesSchema } from "@/schema/manage/place";
import { usePlaceStore } from "@/store/placeStore";
import type { ManagedPlace, PlaceOutlet } from "@/types/ui/manage/place";

const blank = () => ({
	placeId: "",
	name: "",
	kind: "dine-in" as const,
	capacity: 4,
	active: true,
});

export default function PlaceForm({
	outlet,
	areaId,
	place,
}: {
	outlet: PlaceOutlet;
	areaId: string;
	place?: ManagedPlace;
}) {
	const savePlaces = usePlaceStore((state) => state.savePlaces);
	const currentOutlet = usePlaceStore((state) =>
		state.outlets.find((item) => item.id === outlet.id),
	);
	const [success, setSuccess] = React.useState(false);
	const form = useForm<PlacesValues>({
		resolver: zodResolver(placesSchema),
		defaultValues: {
			areaId,
			rows: [
				place
					? {
							placeId: place.id,
							name: place.name,
							kind: place.kind,
							capacity: place.capacity,
							active: place.active,
						}
					: blank(),
			],
		},
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "rows",
	});
	const submit = (values: PlacesValues) => {
		const currentArea = currentOutlet?.areas.find(
			(area) => area.id === values.areaId,
		);
		if (!currentArea) {
			form.setError("areaId", { message: "Area tidak ditemukan." });
			return;
		}
		let duplicate = false;
		values.rows.forEach((row, index) => {
			if (duplicateName(currentArea.places, row.name, row.placeId)) {
				form.setError(`rows.${index}.name`, {
					message: "Nama tempat sudah digunakan di area ini.",
				});
				duplicate = true;
			}
		});
		if (duplicate) return;
		const before = new Set(currentArea.places.map((item) => item.id));
		savePlaces(outlet.id, values);
		const saved = usePlaceStore
			.getState()
			.outlets.find((item) => item.id === outlet.id)
			?.areas.find((area) => area.id === values.areaId);
		const createdIds =
			saved?.places
				.filter((item) => !before.has(item.id))
				.map((item) => item.id) ?? [];
		let next = 0;
		form.reset({
			...values,
			rows: values.rows.map((row) => ({
				...row,
				placeId: row.placeId || createdIds[next++] || "",
			})),
		});
		setSuccess(true);
	};
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text size="normal" w="semibold">
						{outlet.name}
					</Text>
					<Form {...form}>
						<FormField
							control={form.control}
							name="areaId"
							render={() => (
								<FormItem>
									<FormLabel required>Nama Area</FormLabel>
									<FormControl>
										<FormSelect
											data={outlet.areas.map((area) => ({
												value: area.id,
												label: area.name,
											}))}
											disabled={!!place || fields.some((row) => !!row.placeId)}
											label="Pilih Area"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{fields.map((field, index) => (
							<View
								key={field.id}
								className="gap-4 rounded-lg border border-border-muted p-3"
							>
								<View className="flex-row items-center justify-between">
									<Text size="normal" w="semibold">
										Tempat {index + 1}
									</Text>
									{!place && (
										<Button
											variant="link"
											action="negative"
											isDisabled={fields.length === 1 || !!field.placeId}
											onPress={() => remove(index)}
											accessibilityLabel={`Hapus tempat ${index + 1}`}
										>
											<ButtonText>Hapus</ButtonText>
										</Button>
									)}
								</View>
								<FormField
									control={form.control}
									name={`rows.${index}.name`}
									render={() => (
										<FormItem>
											<FormLabel required>Nama Tempat</FormLabel>
											<FormControl>
												<FormInput
													placeholder="Contoh: Meja 01"
													fieldProps={{
														"aria-label": `Nama Tempat ${index + 1}`,
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`rows.${index}.kind`}
									render={() => (
										<FormItem>
											<FormLabel required>Jenis Tempat</FormLabel>
											<FormControl>
												<FormSelect
													data={PLACE_KINDS.map(({ value, label }) => ({
														value,
														label,
													}))}
													label="Jenis Tempat"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`rows.${index}.capacity`}
									render={() => (
										<FormItem>
											<FormLabel required>Kapasitas Total</FormLabel>
											<FormControl>
												<FormInput
													type="number"
													placeholder="Contoh: 4"
													fieldProps={{
														"aria-label": `Kapasitas Total ${index + 1}`,
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`rows.${index}.active`}
									render={({ field: toggle }) => (
										<FormItem>
											<View className="flex-row items-center justify-between gap-3">
												<FormLabel>Aktifkan Tempat</FormLabel>
												<FormControl>
													<Switch
														accessibilityLabel={`Aktifkan Tempat ${index + 1}`}
														value={toggle.value}
														onToggle={toggle.onChange}
														{...(Platform.OS === "web"
															? { activeThumbColor: Colors.light.background }
															: {})}
													/>
												</FormControl>
											</View>
										</FormItem>
									)}
								/>
							</View>
						))}
						{!place && (
							<Button
								variant="outline"
								isDisabled={fields.length >= 100}
								onPress={() => append(blank())}
							>
								<ButtonText>Tambah Tempat Lain</ButtonText>
							</Button>
						)}
					</Form>
				</Card>
			</Wrapper>
			<BottomActionButton onPress={form.handleSubmit(submit)}>
				Simpan Tempat
			</BottomActionButton>
			<SuccessModal
				isOpen={success}
				onClose={() => setSuccess(false)}
				title="Tempat Disimpan"
				description="Tempat disimpan untuk pratinjau selama aplikasi terbuka."
				buttonText="Mengerti"
			/>
		</>
	);
}
