import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { View } from "react-native";

export default function FeatureScreen() {
	return (
		<Wrapper>
			<View className="flex-1 items-center justify-center">
				<Text size="body" w="medium" className="text-muted">
					Segera Hadir
				</Text>
			</View>
		</Wrapper>
	);
}
