import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import {
	Form,
	FormControl,
	FormDateTimePicker,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormSelect,
} from "@/components/common/Form";
import LoadingAction, {
	useLoadingAction,
} from "@/components/common/LoadingAction";
import Text from "@/components/common/Text";
import FinishAction from "@/components/feature/register/wizard/FinishAction";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { BACKUP_METHODS_OPTIONS } from "@/constants/data/other/backup-methods";
import { BACKUP_OPTIONS } from "@/constants/data/other/backup-type";
import { cn, wait } from "@/lib/utils";
import { BackupSchema, backupSchema } from "@/schema/manage/backup";
import { type ExportSchema, exportSchema } from "@/schema/manage/export";

export default function ExportScreen() {
	const params = useLocalSearchParams();

	const form = useForm({
		resolver: zodResolver(exportSchema),
	});

	const loadingAction = useLoadingAction({
		loadingMessage: "Mengunduh...",
		successMessage: "Data berhasil diunduh",
	});

	React.useEffect(() => {
		if (params?.store) {
			form.setValue("store", params.store as string);
		}
	}, [params]);

	const finishModal = useAlertModal();

	async function handleSubmit(data: ExportSchema) {
		// * Call api HERE
		loadingAction.load(async () => {
			await wait(2500);
		});
	}

	return (
		<>
			<LoadingAction
				loadingMessage="Menyimpan..."
				successMessage="Data berhasil diunduh"
				openState={loadingAction.openState}
				loadingState={loadingAction.loadingState}
				onClose={() => router.replace("/manage/export")}
			/>

			<View className="grow bg-zinc-100 pb-5 pt-3">
				<ScrollView
					showsVerticalScrollIndicator={false}
					className="px-4 py-3"
					style={{ height: 0 }}
				>
					<View className="rounded-[20px] bg-white p-4">
						<Form {...form}>
							<View className="gap-6">
								<FormField
									control={form.control}
									name="type"
									render={() => (
										<FormItem>
											<FormLabel>Data Yang Dicadangkan</FormLabel>
											<FormControl className="gap-2">
												{BACKUP_OPTIONS.map((option) => (
													<Pressable
														key={option.value}
														onPress={() => form.setValue("type", option.value)}
													>
														<View
															className={
																"flex-row items-center justify-between rounded-[10px] border border-gray-300 p-2.5"
															}
														>
															<Text
																className="text-sm text-gray-900"
																w="medium"
															>
																{option.label}
															</Text>
															<View
																className={cn(
																	"size-6 items-center justify-center rounded-full bg-gray-100",
																	{
																		"bg-primary-400":
																			form.watch("type") === option.value,
																	},
																)}
															>
																<Feather
																	name="check"
																	size={10}
																	color={
																		form.watch("type") === option.value
																			? "white"
																			: Colors.zinc[400]
																	}
																/>
															</View>
														</View>
													</Pressable>
												))}
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="dateRange"
									render={() => (
										<FormItem>
											<FormLabel>Rentang Waktu</FormLabel>
											<FormControl>
												<FormDateTimePicker
													asRange
													placeholder="1/1/2024 - 1/6/2024"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</View>
						</Form>
					</View>

					<View className="h-8" />
				</ScrollView>
				<ButtonGroup className="mt-auto px-5">
					<Button size="xl" onPress={form.handleSubmit(handleSubmit)}>
						<ButtonText size="md">Simpan</ButtonText>
					</Button>
				</ButtonGroup>
			</View>
		</>
	);
}
