import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { FilterIcon } from "@/components/icons";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
} from "@/components/ui/actionsheet";
import {
	Button,
	ButtonGroup,
	ButtonIcon,
	ButtonText,
} from "@/components/ui/button";
import {
	Checkbox,
	CheckboxGroup,
	CheckboxIcon,
	CheckboxIconDefault,
	CheckboxIndicator,
} from "@/components/ui/checkbox";
import { Colors } from "@/constants/Colors";
import { CATEGORY_ITEMS } from "@/constants/data/category";
import useSearchParamState from "@/hooks/useSearchParamState";
import { cn, tw } from "@/lib/utils";
import { State } from "@/types";

function FilterButton() {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<>
			<ButtonGroup>
				<Button size="sm" variant="outline" onPress={() => setIsOpen(true)}>
					{({ pressed }) => (
						<ButtonIcon
							as={() => (
								<FilterIcon
									color={pressed ? Colors.zinc[50] : Colors.primary}
								/>
							)}
						/>
					)}
				</Button>
			</ButtonGroup>

			<Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<ActionsheetBackdrop />

				<ActionsheetContent className="items-stretch">
					<View className="gap-6">
						<View className="gap-4">
							<Text className="text-base" w="semibold">
								Filter Berdasarkan Abjad
							</Text>
							<View className="flex-row items-center gap-4">
								<ButtonGroup>
									<Button variant="outline" size="xs">
										<ButtonText>A ke Z</ButtonText>
									</Button>
								</ButtonGroup>
								<ButtonGroup>
									<Button variant="outline" size="xs">
										<ButtonText>Z ke A</ButtonText>
									</Button>
								</ButtonGroup>
							</View>
						</View>
						<View className="gap-4">
							<Text className="text-base" w="semibold">
								Filter Berdasarkan Harga
							</Text>
							<View className="flex-row items-center gap-4">
								<ButtonGroup>
									<Button variant="outline" size="xs">
										<ButtonText>Termahal ke Termurah</ButtonText>
									</Button>
								</ButtonGroup>
								<ButtonGroup>
									<Button variant="outline" size="xs">
										<ButtonText>Termurah ke Termahal</ButtonText>
									</Button>
								</ButtonGroup>
							</View>
						</View>
						<View className="gap-4">
							<Text className="text-base" w="semibold">
								Pilihan Restoran
							</Text>
							<View className="gap-3">
								<View className="flex-row items-center justify-between">
									<View className="flex-row items-center gap-2">
										<Text>Promo</Text>
									</View>
									<Checkbox value="a">
										<CheckboxIndicator>
											<CheckboxIcon as={CheckboxIconDefault} />
										</CheckboxIndicator>
									</Checkbox>
								</View>
							</View>
						</View>
					</View>
				</ActionsheetContent>
			</Actionsheet>
		</>
	);
}

const DATA: string[] = ["Semua", ...CATEGORY_ITEMS.map((item) => item.name)];

export function CategoryFilter() {
	const selectedState = useSearchParamState("category", DATA[0]);

	return (
		<FlatList
			data={DATA}
			renderItem={({ item }) => (
				<ButtonGroup>
					<Button size="sm" variant="outline">
						<ButtonText>{item}</ButtonText>
					</Button>
				</ButtonGroup>
			)}
			horizontal
			showsHorizontalScrollIndicator={false}
			ListHeaderComponent={() => (
				<View className="ml-4 mr-2 flex-row gap-2">
					<FilterButton />
					<ButtonGroup>
						<Button size="sm" variant="outline">
							{({ pressed }) => (
								<>
									<ButtonIcon
										as={() => (
											<AntDesign
												name="star"
												size={tw(4)}
												color={pressed ? Colors.zinc[50] : Colors.primary}
											/>
										)}
									/>
									<ButtonText>Favorit</ButtonText>
								</>
							)}
						</Button>
					</ButtonGroup>
				</View>
			)}
			ListFooterComponent={() => <View className="w-4" />}
			ItemSeparatorComponent={() => <View className="w-2" />}
		/>
	);
}
