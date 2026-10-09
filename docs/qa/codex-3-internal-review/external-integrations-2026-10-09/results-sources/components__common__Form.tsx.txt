import Entypo from "@expo/vector-icons/Entypo";
import * as DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { type Href, Link, router } from "expo-router";
import React from "react";
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
	useFormState,
	useWatch,
} from "react-hook-form";
import {
	Image,
	type KeyboardTypeOptions,
	Platform,
	Pressable,
	View,
} from "react-native";
import { EFeather as Feather } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { FONT_NAMES } from "@/constants/Fonts";
import { cn, tw } from "@/lib/utils";
import type { SelectItemProps, SingleDocumentPickerResult } from "@/types";

export type { SelectItemProps };

import CameraIcon from "../icons/camera";
import {
	Checkbox,
	CheckboxGroup,
	CheckboxIcon,
	CheckboxIndicator,
	CheckboxLabel,
} from "../ui/checkbox";
import { Input, InputField, InputIcon } from "../ui/input";
import {
	Radio,
	RadioCircleIndicator,
	RadioGroup,
	RadioLabel,
} from "../ui/radio";
import SingleSelect from "./SingleSelect";
import Text from "./Text";

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue,
);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>({
	...props
}: ControllerProps<TFieldValues, TName, TTransformedValues>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState } = useFormContext();
	const formState = useFormState({ name: fieldContext.name });
	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<typeof View>) {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<View className={cn("gap-2 ", className)} {...props} />
		</FormItemContext.Provider>
	);
}

function FormLabel(
	props: React.ComponentProps<typeof Text> & {
		optional?: boolean;
		required?: boolean;
	},
) {
	const {
		className,
		optional = false,
		required = false,
		children,
		...rest
	} = props;
	const { error, formItemId } = useFormField();

	return (
		<View className="flex flex-row items-center gap-0.5">
			<Text
				size="normal"
				className={cn(error ? "text-red-500" : "text-foreground", className)}
				w="medium"
				{...rest}
			>
				{children}
			</Text>
			{required && (
				<Text size="normal" className="text-red-500 font-medium">
					*
				</Text>
			)}
			{optional && (
				<Text className="text-muted" w="medium" size="small">
					(Opsional)
				</Text>
			)}
		</View>
	);
}

function FormControl({ ...props }: React.ComponentProps<typeof View>) {
	const { error, formItemId, formDescriptionId, formMessageId } =
		useFormField();

	return <View id={formItemId} aria-invalid={!!error} {...props} />;
}

function FormDescription({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	const { formDescriptionId } = useFormField();

	return (
		<Text
			id={formDescriptionId}
			className={cn("text-sm text-muted", className)}
			{...props}
		/>
	);
}

function FormMessage({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error?.message ?? "") : props.children;

	if (!body) {
		return null;
	}

	return (
		<Text
			id={formMessageId}
			className={cn("text-xs text-red-500", className)}
			{...props}
		>
			{body}
		</Text>
	);
}

function FormInput(
	props: React.ComponentProps<typeof Input> & {
		placeholder?: string;
		fieldProps?: React.ComponentProps<typeof InputField>;
		type?: "text" | "password" | "number";
		multiline?: boolean;
		leftIcon?: React.ComponentProps<typeof InputIcon> & Record<string, unknown>;
	},
) {
	const {
		className,
		size = "xl",
		variant = "outline",
		fieldProps,
		placeholder = "Enter your text",
		type = "text",
		multiline = false,
		leftIcon,
		...rest
	} = props;

	const form = useFormContext();
	const { name } = useFormField();

	const { size: fieldSize = "xl", ...restField } = fieldProps ?? {};

	const [secureTextEntry, setSecureTextEntry] = React.useState(true);

	function handleChangeText(text: string) {
		if (type === "number") {
			const numericValue = +text.replace(/[^0-9]/g, "");
			form.setValue(name, numericValue);
			return;
		}

		form.setValue(name, text, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true,
		});
	}

	const keyboardType: KeyboardTypeOptions = (() => {
		switch (type) {
			case "text":
				return "default";
			case "number":
				return "numeric";
			default:
				return "default";
		}
	})();

	const watchedValue = useWatch({ control: form.control, name });
	const formValue = (() => {
		const temp = watchedValue;

		if (type === "number") {
			return temp ? String(temp) : "";
		}
		return temp ?? "";
	})();

	return (
		<Input
			className={cn(
				"h-11 rounded-lg px-3 bg-white border-zinc-200",
				multiline && "h-32 items-start py-3",
				className,
			)}
			size={size}
			variant={variant}
			{...rest}
		>
			{leftIcon && (
				<InputIcon
					{...leftIcon}
					className={cn("text-primary h-5 w-5 mr-2", leftIcon.className)}
				/>
			)}
			<InputField
				size={fieldSize}
				className={cn("text-sm px-0", leftIcon ? "pl-1" : "px-0")}
				placeholder={placeholder}
				onChangeText={handleChangeText}
				value={formValue}
				style={{ fontFamily: FONT_NAMES.regular, fontSize: 14 }}
				secureTextEntry={type === "password" && secureTextEntry}
				keyboardType={keyboardType}
				multiline={multiline}
				textAlignVertical={multiline ? "top" : "center"}
				{...restField}
			/>

			{type === "password" && (
				<Pressable onPress={() => setSecureTextEntry((prev) => !prev)}>
					<InputIcon
						as={() => (
							<Feather
								name={secureTextEntry ? "eye" : "eye-off"}
								size={20}
								color={Colors.zinc[400]}
							/>
						)}
					/>
				</Pressable>
			)}
		</Input>
	);
}

export function FormImageInput(props: React.ComponentProps<typeof View> & {}) {
	const { className, ...rest } = props;

	const form = useFormContext();
	const { name } = useFormField();

	const [asset, setAsset] = React.useState<SingleDocumentPickerResult | null>(
		null,
	);

	async function handlePress() {
		const result = await DocumentPicker.getDocumentAsync({
			type: "image/*",
			copyToCacheDirectory: true,
			multiple: false,
		});

		const selectedAsset = result.assets?.[0] ?? null;

		if (selectedAsset) {
			setAsset(selectedAsset);
			form.setValue(name, selectedAsset);
		}
	}

	return (
		<Pressable onPress={handlePress}>
			{({ pressed }) => (
				<View
					className={cn(
						"size-[72px] items-center justify-center rounded-[10px] bg-gray-100",
						className,
					)}
					style={{ opacity: pressed ? 0.75 : 1 }}
					{...rest}
				>
					{asset ? (
						<View className="h-full w-full overflow-hidden rounded-[10px]">
							<Image
								source={{ uri: asset.uri }}
								className="h-full w-full object-cover"
							/>
						</View>
					) : (
						<CameraIcon color={Colors.zinc[400]} />
					)}
				</View>
			)}
		</Pressable>
	);
}

export type FormSelectProps = {
	placeholder?: string;
	label?: string;
	data: SelectItemProps[];
	className?: string;
	searchable?: boolean;
	searchPlaceholder?: string;
	leftIcon?: React.ReactNode;
	renderItemIcon?: (item: SelectItemProps) => React.ReactNode;
	disabled?: boolean;
	size?: "xl" | "lg" | "md" | "sm";
	variant?: "outline" | "rounded" | "underlined" | "ghost";
	showConfirmButton?: boolean;
	confirmText?: string;
	dismissOnSelect?: boolean;
};

function FormSelect(props: FormSelectProps) {
	const {
		placeholder = "Pilih salah satu",
		label,
		data,
		className,
		searchable,
		searchPlaceholder,
		leftIcon,
		renderItemIcon,
		disabled,
		size = "xl",
		variant = "outline",
		showConfirmButton,
		confirmText,
		dismissOnSelect,
	} = props;

	const form = useFormContext();
	const { name } = useFormField();

	const formValue = form.watch(name);
	const selectedItem =
		data.find((item) => item.value === formValue) ??
		data.find((item) => item.label === formValue);

	return (
		<SingleSelect
			items={data}
			value={selectedItem?.value ?? formValue}
			onValueChange={(value) =>
				form.setValue(name, value, {
					shouldValidate: true,
					shouldDirty: true,
				})
			}
			placeholder={placeholder}
			label={label ?? placeholder}
			searchable={searchable}
			searchPlaceholder={searchPlaceholder}
			leftIcon={leftIcon}
			renderItemIcon={renderItemIcon}
			disabled={disabled}
			size={size}
			variant={variant}
			className={className}
			showConfirmButton={showConfirmButton}
			confirmText={confirmText}
			dismissOnSelect={dismissOnSelect}
		/>
	);
}

function FormDateTimePicker(
	props: React.ComponentProps<typeof Pressable> & {
		placeholder?: string;
		fieldProps?: React.ComponentProps<typeof View>;
		asRange?: boolean;
		type?: "date" | "time";
	},
) {
	const {
		className,
		fieldProps,
		placeholder = "Pilih tanggal",
		asRange = false,
		type = "date",
		...rest
	} = props;

	const form = useFormContext();
	const { name } = useFormField();

	const { ...restField } = fieldProps ?? {};

	function handleStartDateChange(
		event: DateTimePicker.DateTimePickerEvent,
		date?: Date,
	) {
		if (asRange) {
			if (event.type === "set") {
				form.setValue(`${name}.start`, date);
				handleEndDateChange();
			}
		} else {
			if (event.type === "set") {
				form.setValue(name, date);
			}
		}
	}

	function handleEndDateChange() {
		if (Platform.OS === "android") {
			DateTimePicker.DateTimePickerAndroid.dismiss(type);
			DateTimePicker.DateTimePickerAndroid.open({
				mode: type,
				is24Hour: true,
				onChange: (event, datetime) => {
					if (event.type === "set") {
						if (form.getValues(`${name}.start`) > datetime!) {
							alert("Tanggal akhir tidak boleh lebih kecil dari tanggal awal");
							form.setValue(`${name}.end`, form.getValues(`${name}.start`));
							return;
						}

						form.setValue(`${name}.end`, datetime);
					}
				},
				value: new Date(),
			});
		}
	}

	function handleInputPress() {
		if (Platform.OS === "android") {
			DateTimePicker.DateTimePickerAndroid.open({
				mode: type,
				is24Hour: true,
				onChange: handleStartDateChange,
				value: new Date(),
			});
		}
	}

	const hasValue = (() => {
		if (asRange) {
			return form.watch(`${name}.start`) && form.watch(`${name}.end`)
				? true
				: false;
		} else {
			return form.watch(name) ? true : false;
		}
	})();

	const startDate = form.watch(asRange ? `${name}.start` : name);
	const endDate = form.watch(`${name}.end`);
	const formattedStart = React.useMemo(() => {
		if (startDate) {
			if (type === "date") {
				return startDate.toLocaleDateString();
			} else if (type === "time") {
				return startDate.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
			}
		}

		return placeholder;
	}, [startDate, type, placeholder]);

	const formattedEnd = React.useMemo(() => {
		if (endDate) {
			if (type === "date") {
				return ` - ${endDate.toLocaleDateString()}`;
			} else if (type === "time") {
				return ` - ${endDate.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			}
		}

		return "";
	}, [endDate, type]);

	return (
		<Pressable
			onPress={handleInputPress}
			className={cn("h-12 justify-center rounded-lg bg-gray-100", className)}
			{...rest}
		>
			<View className="flex-row items-center justify-between gap-3 px-3">
				<Text
					className={cn("text-sm", hasValue ? "text-gray-900" : "text-muted")}
					style={{ fontFamily: FONT_NAMES.regular }}
				>
					{asRange ? (
						<>
							{formattedStart}

							{formattedEnd}
						</>
					) : form.watch(name) ? (
						formattedStart
					) : (
						placeholder
					)}
				</Text>
				<Feather name="calendar" size={16} color={Colors.zinc[400]} />
			</View>
		</Pressable>
	);
}

function FormRadio(
	props: React.ComponentProps<typeof RadioGroup> & {
		data: SelectItemProps[];
		radioProps?: React.ComponentProps<typeof Radio>;
		labelProps?: React.ComponentProps<typeof RadioLabel>;
	},
) {
	const { className, data, radioProps, labelProps, ...rest } = props;

	const form = useFormContext();
	const { name } = useFormField();

	const formValue = form.watch(name);

	return (
		<RadioGroup
			className={className}
			value={formValue}
			onChange={(value) => {
				form.setValue(name, value, {
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true,
				});
			}}
			{...rest}
		>
			{data.map((item) => (
				<Radio key={item.value} value={item.value} {...radioProps}>
					<RadioCircleIndicator />
					<RadioLabel {...labelProps}>{item.label}</RadioLabel>
				</Radio>
			))}
		</RadioGroup>
	);
}

function FormCheckbox(
	props: React.ComponentProps<typeof View> & {
		data: SelectItemProps;
		href?: Href;
		disabled?: boolean;
	},
) {
	const { className, data, href, disabled, ...rest } = props;

	const form = useFormContext();
	const { name } = useFormField();

	const value = form.watch(name);
	const error = form.formState.errors[name];

	return (
		<Checkbox
			value={data.value}
			isChecked={!!value}
			onChange={(isChecked) => {
				if (href && isChecked) {
					router.push(href);
					return;
				}

				form.setValue(name, isChecked, {
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true,
				});
			}}
			aria-label={data.label}
			className={cn("my-2", className)}
			isInvalid={!!error}
			isDisabled={disabled}
			{...rest}
		>
			<CheckboxIndicator>
				<CheckboxIcon as={Feather} name="check" />
			</CheckboxIndicator>
			{href ? (
				<Link
					href={href}
					className={cn("text-sm text-primary underline")}
					style={{
						fontFamily: FONT_NAMES.regular,
					}}
				>
					{data.label}
				</Link>
			) : (
				<CheckboxLabel
					className={cn("text-sm text-gray-900")}
					style={{
						fontFamily: FONT_NAMES.regular,
					}}
				>
					{data.label}
				</CheckboxLabel>
			)}
		</Checkbox>
	);
}

function FormMultiCheckbox<T extends SelectItemProps>(
	props: Omit<React.ComponentProps<typeof CheckboxGroup>, "value"> & {
		data: T[];
		checkboxProps?: React.ComponentProps<typeof Checkbox>;
		labelProps?: React.ComponentProps<typeof CheckboxLabel>;
		extraComponent?:
			| React.ReactNode
			| ((item: T, isChecked: boolean) => React.ReactNode);
	},
) {
	const {
		className,
		data,
		checkboxProps,
		labelProps,
		extraComponent,
		...rest
	} = props;

	const form = useFormContext();
	const { name } = useFormField();

	const formValue = form.watch(name) || [];

	return (
		<CheckboxGroup
			className={cn("gap-3", className)}
			value={formValue}
			onChange={(values) => {
				form.setValue(name, values, {
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true,
				});
			}}
			{...rest}
		>
			{data.map((item) => (
				<Checkbox
					key={item.value}
					value={item.value}
					className="items-center"
					{...checkboxProps}
				>
					<CheckboxIndicator>
						<CheckboxIcon as={Entypo} name="check" />
					</CheckboxIndicator>
					<CheckboxLabel
						className="text-sm text-gray-900"
						style={{ fontFamily: FONT_NAMES.regular }}
						{...labelProps}
					>
						{item.label}
					</CheckboxLabel>
					{extraComponent && (
						<View className="ml-auto">
							{typeof extraComponent === "function"
								? extraComponent(item, !!formValue.includes(item.value))
								: extraComponent}
						</View>
					)}
				</Checkbox>
			))}
		</CheckboxGroup>
	);
}

export {
	Form,
	FormCheckbox,
	FormControl,
	FormDateTimePicker,
	FormDescription,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
	FormMultiCheckbox,
	FormRadio,
	FormSelect,
	useFormField,
};
