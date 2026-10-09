import React from "react";
import {View} from "react-native";
import Text from "@/components/common/Text";
import Card from "@/components/common/Card";
import MainMenu from "@/components/feature/cashier-home/MainMenu";
export default function FavoriteSection(){return (<View className="mt-4 gap-3 px-4">
				<Text size="normal" w="semibold">
					Menu Favorit
				</Text>
				<Card density="compact" appearance="figma">
					<MainMenu />
				</Card>
			</View>);}
