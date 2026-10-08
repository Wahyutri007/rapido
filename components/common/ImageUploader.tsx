import Feather from "@expo/vector-icons/Feather";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import { Alert, Image, Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";
import type { SingleDocumentPickerResult } from "@/types";

export type ImageUploaderProps = {
	value?: SingleDocumentPickerResult | string | null;
	onChange: (asset: SingleDocumentPickerResult | null) => void;
	title?: string;
	subtitle?: string;
	maxSizeMb?: number;
	disabled?: boolean;
	removable?: boolean;
	className?: string;
};

export default function ImageUploader({
	value,
	onChange,
	title = "Klik untuk upload gambar",
	subtitle,
	maxSizeMb = 2,
	disabled = false,
	removable = true,
	className,
}: ImageUploaderProps) {
	const [isLoading, setIsLoading] = React.useState(false);

	const resolvedSubtitle = subtitle ?? `PNG, JPG maks. ${maxSizeMb}MB`;

	async function handlePickImage() {
		if (disabled || isLoading) return;

		try {
			setIsLoading(true);
			const result = await DocumentPicker.getDocumentAsync({
				type: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
				copyToCacheDirectory: true,
				multiple: false,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const asset = result.assets[0];

				if (asset.size && asset.size > maxSizeMb * 1024 * 1024) {
					Alert.alert(
						"Ukuran File Terlalu Besar",
						`Ukuran gambar maksimal adalah ${maxSizeMb}MB.`,
					);
					return;
				}

				onChange(asset);
			}
		} catch (error) {
			console.error("Error picking image:", error);
		} finally {
			setIsLoading(false);
		}
	}

	function handleRemove() {
		if (disabled) return;
		onChange(null);
	}

	const imageUri =
		typeof value === "string"
			? value
			: ((value as SingleDocumentPickerResult)?.uri ?? null);

	const fileName =
		typeof value === "string"
			? "Gambar Terpilih"
			: ((value as SingleDocumentPickerResult)?.name ?? "Gambar Terpilih");

	if (imageUri) {
		return (
			<View
				className={cn(
					"relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-3",
					className,
				)}
			>
				<View className="flex-row items-center gap-3">
					<View className="size-16 overflow-hidden rounded-lg border border-zinc-200 bg-white">
						<Image
							source={{ uri: imageUri }}
							className="size-full"
							resizeMode="contain"
						/>
					</View>
					<View className="flex-1 justify-center">
						<Text
							w="medium"
							size="small"
							numberOfLines={1}
							className="text-foreground"
						>
							{fileName}
						</Text>
						<Pressable
							onPress={handlePickImage}
							disabled={disabled || isLoading}
							className="mt-1"
						>
							<Text size="small" className="font-medium text-primary">
								Ganti gambar
							</Text>
						</Pressable>
					</View>
					{!disabled && removable && (
						<Pressable
							onPress={handleRemove}
							className="size-8 items-center justify-center rounded-full bg-zinc-200 active:bg-zinc-300"
						>
							<Feather name="x" size={16} color={Colors.zinc[700]} />
						</Pressable>
					)}
				</View>
			</View>
		);
	}

	return (
		<Pressable
			onPress={handlePickImage}
			disabled={disabled || isLoading}
			className={cn(
				"items-center justify-center rounded-xl border border-dashed border-primary bg-primary-50/50 py-5 active:bg-primary-50",
				disabled && "opacity-50",
				className,
			)}
		>
			<Feather name="upload-cloud" size={26} color={Colors.primary} />
			<Text size="normal" w="semibold" className="mt-1 text-primary">
				{title}
			</Text>
			<Text size="small" className="mt-0.5 text-xs text-muted">
				{resolvedSubtitle}
			</Text>
		</Pressable>
	);
}
