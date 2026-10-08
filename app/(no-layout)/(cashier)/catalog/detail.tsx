import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import type React from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { create } from "zustand";
import {
	Form,
	FormCheckbox,
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMultiCheckbox,
	FormRadio,
	FormSelect,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { CardListSeparator } from "@/components/custom/CardList";
import Incrementer from "@/components/custom/Incrementer";
import { EEntypo, EFeather, EEntypo as Entypo } from "@/components/icons";
import {
	Button,
	ButtonGroup,
	ButtonIcon,
	ButtonText,
} from "@/components/ui/button";
import {
	Checkbox,
	CheckboxIcon,
	CheckboxIndicator,
	CheckboxLabel,
} from "@/components/ui/checkbox";
import Separator from "@/components/ui/Separator";
import { FONT_NAMES } from "@/constants/Fonts";
import { cn, formatRp, tw } from "@/lib/utils";
import { CartDetailItem } from "@/types/api/cart";
import { MenuItemProps } from "@/types/ui/add/menu";
import { VariantItemProps } from "@/types/ui/add/variant";

const detailScreenStore = create<{
	orderTypeId: string | null;
	setOrderTypeId: (orderTypeId: string | null) => void;
}>((set) => ({
	orderTypeId: null,
	setOrderTypeId: (orderTypeId: string | null) => set({ orderTypeId }),
}));

function OrderTypeSelector() {
	return (
		<FlatList
			horizontal
			data={["Dine In", "Take Away", "Tipe Lain"]}
			showsHorizontalScrollIndicator={false}
			ItemSeparatorComponent={() => <View className="w-2" />}
			renderItem={({ item }) => (
				<ButtonGroup>
					<Button size="sm" variant="outline">
						<ButtonText>{item}</ButtonText>
					</Button>
				</ButtonGroup>
			)}
		/>
	);
}

function VariantSelector(
	props: React.ComponentProps<typeof View> & { form: UseFormReturn },
) {
	const { form, ...viewProps } = props;

	return (
		<View {...viewProps}>
			<FormField
				control={form.control}
				name="variant"
				render={() => (
					<FormItem>
						<FormLabel className="text-base" w="semibold">
							Pilih Varian
						</FormLabel>
						<FormControl>
							<FormRadio
								data={[
									{ value: "a", label: "Mini" },
									{ value: "b", label: "Sedang" },
									{ value: "c", label: "Besar" },
								]}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
		</View>
	);
}

function ExtraSelector(
	props: React.ComponentProps<typeof View> & { form: UseFormReturn },
) {
	const { form, ...viewProps } = props;

	const selectedExtras = (form.watch("extras") || []) as {
		value: string;
		amount: number;
	}[];

	const FORM_DUMMY = [
		{ value: "a", label: "Extra A", price: 1000 },
		{ value: "b", label: "Extra B", price: 2000 },
		{ value: "c", label: "Extra C", price: 3000 },
	];

	const handleCheckboxChange = (itemValue: string, isChecked: boolean) => {
		if (isChecked) {
			form.setValue(
				"extras",
				[...selectedExtras, { value: itemValue, amount: 1 }],
				{
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true,
				},
			);
		} else {
			form.setValue(
				"extras",
				selectedExtras.filter((extra) => extra.value !== itemValue),
				{
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true,
				},
			);
		}
	};

	const handleAmountChange = (itemValue: string, newAmount: number) => {
		form.setValue(
			"extras",
			selectedExtras.map((extra) =>
				extra.value === itemValue ? { ...extra, amount: newAmount } : extra,
			),
			{
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			},
		);
	};

	return (
		<View {...viewProps}>
			<FormField
				control={form.control}
				name="extras"
				render={() => (
					<FormItem>
						<FormLabel className="text-base" w="semibold" optional>
							Tambahan Topping
						</FormLabel>
						<FormControl>
							<View className="gap-3">
								{FORM_DUMMY.map((item) => {
									const matchedExtra = selectedExtras.find(
										(extra) => extra.value === item.value,
									);
									const isChecked = !!matchedExtra;
									const amount = matchedExtra?.amount ?? 1;

									return (
										<View
											key={item.value}
											className="flex-row items-center justify-between"
										>
											<Checkbox
												value={item.value}
												isChecked={isChecked}
												onChange={(checked) =>
													handleCheckboxChange(item.value, checked)
												}
												aria-label={item.label}
											>
												<CheckboxIndicator>
													<CheckboxIcon
														as={EFeather}
														name="check"
														size={tw(4)}
													/>
												</CheckboxIndicator>
												<CheckboxLabel
													className="text-sm text-gray-900 ml-2"
													style={{
														fontFamily: FONT_NAMES.regular,
													}}
												>
													{item.label}
												</CheckboxLabel>
											</Checkbox>

											<View className="flex-row items-center gap-3">
												<Text className={isChecked ? "" : "text-zinc-500"}>
													+
													{formatRp(
														isChecked ? item.price * amount : item.price,
													)}
												</Text>
												{isChecked && (
													<Incrementer
														min={1}
														value={amount}
														onChange={(newAmount) =>
															handleAmountChange(item.value, newAmount)
														}
													/>
												)}
											</View>
										</View>
									);
								})}
							</View>
						</FormControl>
					</FormItem>
				)}
			/>
		</View>
	);
}

function ResponsibleSelector(
	props: React.ComponentProps<typeof View> & { form: UseFormReturn },
) {
	const { form, ...viewProps } = props;

	return (
		<View {...viewProps}>
			<View className="flex-row items-center gap-1">
				<Text className="text-base" w="semibold">
					Penanggung Jawab
				</Text>
				<Text className="text-red-400">*</Text>
			</View>
			<View className="mt-4">
				<FormField
					control={props.form.control}
					name="responsible"
					render={() => (
						<FormItem>
							<FormControl>
								<FormSelect
									data={[
										{ label: "Orang a", value: "a" },
										{ label: "Orang b", value: "b" },
									]}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			</View>
		</View>
	);
}

function DiscountSelector(
	props: React.ComponentProps<typeof View> & { form: UseFormReturn },
) {
	const { form, className, ...viewProps } = props;

	const isCustomDiscount = form.watch("discount") === "_custom";

	return (
		<View {...viewProps} className={cn("gap-2", className)}>
			<FormField
				control={form.control}
				name="discount"
				render={() => (
					<FormItem>
						<FormLabel className="text-base" w="semibold" optional>
							Diskon Tambahan
						</FormLabel>
						<FormControl>
							<FormSelect
								data={[
									{ value: "_custom", label: "Custom" },
									{ value: "a", label: "a" },
									{ value: "c", label: "c" },
								]}
							/>
						</FormControl>
					</FormItem>
				)}
			/>

			{isCustomDiscount && (
				<FormField
					control={form.control}
					name="discountValue"
					render={() => (
						<FormItem>
							<FormControl>
								<FormInput placeholder="Rp 10.000" />
							</FormControl>
						</FormItem>
					)}
				/>
			)}
		</View>
	);
}

export default function OrderDetailScreen() {
	const params = useLocalSearchParams();

	const form = useForm<any>({
		defaultValues: {
			extras: [],
		},
	});

	return (
		<View className="bg-white grow">
			<Wrapper>
				<Form {...form}>
					<View className=" gap-4 py-4">
						<View className="px-4">
							<OrderTypeSelector />
						</View>

						<View className="flex-row items-center justify-between px-4">
							<Text className="text-base" w="bold">
								Food
							</Text>
							<Text className="text-sm text-gray-900" w="semibold">
								{formatRp(9999999)}
							</Text>
						</View>

						<Separator className="mx-4" />
						<VariantSelector form={form} className="px-4" />
						<Separator className="mx-4" />
						<ExtraSelector form={form} className="px-4" />
						<Separator className="mx-4" />
						<ResponsibleSelector form={form} className="px-4" />
						<Separator className="mx-4" />
						<DiscountSelector form={form} className="px-4" />
						<Separator className="mx-4" />

						<View className="px-5">
							<FormField
								control={form.control}
								name="note"
								render={() => (
									<FormItem>
										<FormLabel className="text-base" w="semibold">
											Catatan
										</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Kurangi tingkat pedasnya"
												className="h-24"
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</View>
					</View>
				</Form>

				<View className="h-32" />
			</Wrapper>
			<View className="absolute bottom-0 z-10 w-full p-4 gap-4 rounded-t-3xl border border-zinc-200 bg-white">
				<View className="flex-row justify-between items-center">
					<Text w="medium">Jumlah Pembelian</Text>
					<Incrementer min={1} />
				</View>
				<ButtonGroup>
					<Button>
						<ButtonText>Tambah Pembelian - [PRICE]</ButtonText>
					</Button>
				</ButtonGroup>
			</View>
		</View>
	);
}
