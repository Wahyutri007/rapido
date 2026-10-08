import { Image, View } from "react-native";
import { EFeather } from "@/components/icons";

export default function WorkerAvatar({ uri }: { uri?: string | null }) {
	return (
		<View className="size-10 shrink-0 overflow-hidden items-center justify-center rounded-lg bg-primary/10">
			{uri ? (
				<Image
					source={{ uri }}
					className="size-full"
					resizeMode="cover"
					accessibilityLabel="Foto karyawan"
				/>
			) : (
				<EFeather name="user" size={24} className="text-primary" />
			)}
		</View>
	);
}
