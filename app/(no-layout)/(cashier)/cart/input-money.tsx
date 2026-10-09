import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BouncyPressable from "@/components/common/BouncyPressable";
import { Form, FormField, FormMessage } from "@/components/common/Form";
import Keypad, { type KeypadState } from "@/components/common/Keypad";
import Text from "@/components/common/Text";
import { Button, ButtonText } from "@/components/ui/button";
import {
	formatCashDigits,
	getCashQuickAmounts,
} from "@/lib/cashier/cash-input";
import { cashInputTheme } from "@/lib/cashier/cash-input-theme";
import { formatRp } from "@/lib/utils";
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
	const insets = useSafeAreaInsets();
	const active = React.useRef(false);
	const submitting = React.useRef(false);
	const form = useForm<CashInputSchema>({
		resolver: zodResolver(createCashInputSchema(totalPrice)),
		defaultValues: { value: initialValue },
	});
	const value = useWatch({ control: form.control, name: "value" }) ?? "";
	const displayValue = formatCashDigits(value);
	const [amountWidth, setAmountWidth] = React.useState<number | null>(null);
	// Keep the Figma 32px size for normal values. A conservative Inter glyph
	// budget also keeps 16-digit amounts readable on web, where native fitting
	// is unavailable. Measure the real container rather than the device width.
	const amountFontSize =
		amountWidth === null
			? 32
			: Math.min(32, (amountWidth - 4) / (displayValue.length * 0.7 + 1.4));
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
		<View className="flex-1 bg-background" style={cashInputTheme}>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
				<View
					className="flex-1 items-center px-4"
					style={{ paddingTop: 105, paddingBottom: 24, minHeight: 177 }}
				>
					<View
						className="w-full items-center gap-2"
						onLayout={({ nativeEvent }) => {
							if (nativeEvent.layout.width > 4) {
								setAmountWidth(nativeEvent.layout.width);
							}
						}}
					>
						<View
							className="flex-row items-center justify-center gap-1"
							style={{ maxWidth: "100%" }}
						>
							<Text
								className="shrink-0 text-muted"
								w="medium"
								style={{ fontSize: amountFontSize, lineHeight: 48 }}
							>
								Rp
							</Text>
							<Text
								className="shrink text-foreground"
								w="medium"
								style={{ fontSize: amountFontSize, lineHeight: 48 }}
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.45}
							>
								{displayValue}
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
				<View className="gap-3 bg-surface pb-3">
					<View
						className="flex-row items-center justify-center"
						style={{ height: 39 }}
					>
						{getCashQuickAmounts(totalPrice).map((quickAmount) => (
							<BouncyPressable
								key={quickAmount}
								className="items-center justify-center rounded-lg bg-white"
								style={{ height: 39, paddingHorizontal: 25 }}
								onPress={() => setValue(String(quickAmount))}
								disabled={!focused}
								ripple
								hapticType="light"
								accessibilityRole="button"
								accessibilityLabel={`Isi uang ${formatRp(quickAmount)}`}
							>
								<Text
									size="small"
									className="text-subtle"
									style={{ lineHeight: 14.4 }}
								>
									Rp {formatCashDigits(String(quickAmount))}
								</Text>
							</BouncyPressable>
						))}
					</View>
					<Keypad
						state={[value || null, setValue]}
						controlled
						nullable
						maxLength={16}
						appearance="cashier"
					/>
				</View>
			</ScrollView>
			<View
				className="bg-surface"
				style={{
					paddingTop: 10,
					paddingBottom: 30 + insets.bottom,
					paddingLeft: 20 + insets.left,
					paddingRight: 20 + insets.right,
				}}
			>
				<Button
					size="xl"
					isDisabled={!isValid}
					style={{
						opacity: !isValid ? 0.5 : 1,
						pointerEvents: !isValid ? "none" : "auto",
					}}
					onPress={() => form.handleSubmit(handleContinue)()}
				>
					<ButtonText size="lg" style={{ lineHeight: 19.2 }}>
						Bayar
					</ButtonText>
				</Button>
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
