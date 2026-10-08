import { View } from "react-native";
import { EFeather } from "@/components/icons";

export default function MemberIcon() {
	return (
		<View className="size-10 items-center justify-center rounded-lg bg-primary/10">
			<EFeather name="user" size={24} className="text-primary" />
		</View>
	);
}
