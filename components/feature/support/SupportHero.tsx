import { Image, View } from "react-native";
import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";
import type { SupportFormMode } from "@/types/ui/support";

const HERO_CONTENT = {
	"feature-request": {
		title: "Punya ide untuk fitur baru?",
		description:
			"Sampaikan ide atau kebutuhan Anda. Tim kami akan meninjau dan mempertimbangkannya untuk pengembangan POS menjadi lebih baik.",
		image: require("@/assets/images/support/feature-request.png"),
	},
	feedback: {
		title: "Kami ingin mendengar pendapatmu",
		description:
			"Masukan, kritik, dan saran Anda sangat berharga untuk membuat aplikasi POS menjadi lebih baik.",
		image: require("@/assets/images/support/feedback.png"),
	},
};

export default function SupportHero({ mode }: { mode: SupportFormMode }) {
	const content = HERO_CONTENT[mode];
	const isFeedback = mode === "feedback";

	return (
		<View className="relative min-h-[140px] overflow-hidden rounded-xl bg-primary/10 p-5">
			<Image
				source={content.image}
				accessibilityIgnoresInvertColors
				accessible={false}
				resizeMode="cover"
				style={
					isFeedback
						? {
								position: "absolute",
								width: 140,
								height: 140,
								right: 12,
								top: 20,
							}
						: {
								position: "absolute",
								width: 148,
								height: 148,
								right: 0,
								top: -8,
							}
				}
			/>
			<View className={cn("gap-2", isFeedback ? "w-3/5" : "w-3/4")}>
				<Text
					size="normal"
					w="semibold"
					className={cn(isFeedback && "text-primary")}
				>
					{content.title}
				</Text>
				<Text size="small" className="leading-4 text-foreground">
					{content.description}
				</Text>
			</View>
		</View>
	);
}
