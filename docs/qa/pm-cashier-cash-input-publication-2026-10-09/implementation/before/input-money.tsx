import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { View } from "react-native";
import { Form, FormField, FormMessage } from "@/components/common/Form";
import Keypad, { type KeypadState } from "@/components/common/Keypad";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { parseRp } from "@/lib/utils";
import {
	type CashInputSchema,
	createCashInputSchema,
	parseCashAmount,
	parseCashRouteAmount,
} from "@/schema/cashier/cash-input";

function CashInputForm({
	totalPrice,
	initialValue,
}: {
	totalPrice: number | null;
	initialValue: string;
}) {
	const focused = useIsFocused();
	const active = React.useRef(false);
	const submitting = React.useRef(false);
	const form = useForm<CashInputSchema>({
		resolver: zodResolver(createCashInputSchema(totalPrice)),
		defaultValues: { value: initialValue },
	});
	const value = useWatch({ control: form.control, name: "value" }) ?? "";
	const amount = parseCashAmount(value);
	const isValid =
		focused &&
		totalPrice !== null &&
		amount !== null &&
		amount > 0 &&
		amount >= totalPrice;

	React.useEffect(() => {
		active.current = focused;
		return () => {
			active.current = false;
		};
	}, [focused]);

	React.useEffect(() => {
		if (totalPrice === null) {
			form.setError("value", {
				message: "Total pembayaran belum tersedia. Kembali ke pesanan.",
			});
		}
	}, [form, totalPrice]);

	const setValue = React.useCallback<
		React.Dispatch<React.SetStateAction<KeypadState>>
	>(
		(next) => {
			if (!active.current) return;
			const previous = form.getValues("value") || null;
			const updated = typeof next === "function" ? next(previous) : next;
			form.setValue("value", updated ?? "", { shouldDirty: true });
			if (totalPrice !== null) form.clearErrors("value");
		},
		[form, totalPrice],
	);

	function handleContinue(data: CashInputSchema) {
		const received = parseCashAmount(data.value);
		if (
			!active.current ||
			submitting.current ||
			form.getValues("value") !== data.value ||
			totalPrice === null ||
			received === null ||
			received <= 0 ||
			received < totalPrice
		) {
			return;
		}
		submitting.current = true;
		try {
			router.replace({
				pathname: "/cart/input-money-confirm",
				params: { value: received, totalPrice },
			});
		} catch {
			submitting.current = false;
			form.setError("value", {
				message: "Tidak bisa membuka konfirmasi. Coba lagi.",
			});
		}
	}

	return (
		<View className="grow bg-zinc-50">
			<View className="grow items-center justify-center gap-1 px-16">
				<View className="items-center gap-2">
					<View className="flex-row items-center justify-center">
						<Text className="shrink-0 text-[32px] text-muted" w="medium">
							Rp
						</Text>
						<Text className="text-[32px] text-gray-900" w="medium">
							{parseRp(value, false)}
						</Text>
					</View>
					<Form {...form}>
						<FormField
							control={form.control}
							name="value"
							render={() => <FormMessage />}
						/>
					</Form>
				</View>
			</View>
			<View className="mt-auto">
				<Keypad
					state={[value || null, setValue]}
					controlled
					nullable
					maxLength={16}
				/>
				<ButtonGroup className="bg-white px-8 pb-8 pt-2">
					<Button
						size="xl"
						isDisabled={!isValid}
						style={{
							opacity: !isValid ? 0.5 : 1,
							pointerEvents: !isValid ? "none" : "auto",
						}}
						onPress={() => form.handleSubmit(handleContinue)()}
					>
						<ButtonText size="md">Lanjut</ButtonText>
					</Button>
				</ButtonGroup>
			</View>
		</View>
	);
}

export default function InputKas() {
	const params = useLocalSearchParams();
	const totalPrice = parseCashRouteAmount(params.totalPrice);
	const initialAmount = parseCashRouteAmount(params.value);

	return (
		<CashInputForm
			key={JSON.stringify([params.totalPrice ?? null, params.value ?? null])}
			totalPrice={totalPrice}
			initialValue={initialAmount === null ? "" : String(initialAmount)}
		/>
	);
}
