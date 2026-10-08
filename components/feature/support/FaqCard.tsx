import { Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import {
	ChartIcon,
	EFeather,
	EFontAwesome6,
	EMaterial,
	InventoryIcon,
} from "@/components/icons";
import type { FaqEntry } from "@/types/ui/support";

const ICONS = {
	sales: <ChartIcon size={24} className="text-primary" />,
	inventory: <InventoryIcon size={24} className="text-success" />,
	cashier: (
		<EFontAwesome6 name="cash-register" size={24} className="text-success" />
	),
	absence: <EMaterial name="badge" size={24} className="text-warning" />,
	order: (
		<EFontAwesome6 name="bell-concierge" size={24} className="text-primary" />
	),
	catalog: <EFeather name="tag" size={24} className="text-primary" />,
};

const ICON_BACKGROUNDS = {
	sales: "bg-primary/10",
	inventory: "bg-success/10",
	cashier: "bg-success/10",
	absence: "bg-warning/10",
	order: "bg-primary/5",
	catalog: "bg-primary/10",
};

export default function FaqCard({
	entry,
	expanded,
	onToggle,
}: {
	entry: FaqEntry;
	expanded: boolean;
	onToggle: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={entry.question}
			accessibilityState={{ expanded }}
			onPress={onToggle}
		>
			<Card density="compact" className="gap-3">
				<View className="flex-row items-center gap-3">
					<View
						className={`size-10 items-center justify-center rounded-lg ${ICON_BACKGROUNDS[entry.icon]}`}
					>
						{ICONS[entry.icon]}
					</View>
					<Text size="normal" w="medium" className="flex-1">
						{entry.question}
					</Text>
					<EFeather
						name={expanded ? "chevron-up" : "chevron-down"}
						size={16}
						className="text-muted"
					/>
				</View>
				{expanded && (
					<View className="gap-3">
						<View className="h-px bg-border-muted" />
						<Text size="normal" className="text-subtle">
							{entry.answer}
						</Text>
					</View>
				)}
			</Card>
		</Pressable>
	);
}
