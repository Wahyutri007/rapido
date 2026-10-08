import { createSwitch } from "@gluestack-ui/core/switch/creator";
import type React from "react";
import { Switch as NativeSwitch, Platform } from "react-native";
import { Colors } from "@/constants/Colors";

const UISwitch = createSwitch({ Root: NativeSwitch });

export function Switch(props: React.ComponentProps<typeof UISwitch>) {
	return (
		<UISwitch
			trackColor={{ false: Colors.zinc[300], true: Colors.primary }}
			thumbColor={Colors.zinc[50]}
			{...(Platform.OS === "web" ? { activeThumbColor: Colors.zinc[50] } : {})}
			ios_backgroundColor={Colors.zinc[300]}
			{...props}
		/>
	);
}
