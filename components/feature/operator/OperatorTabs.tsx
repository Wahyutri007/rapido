import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";
import type { OperatorOrderStatus } from "@/store/useOperatorStore";
import React from "react";
import { Pressable, View } from "react-native";

type OperatorTabsProps = {
	activeTab: OperatorOrderStatus;
	onTabChange: (tab: OperatorOrderStatus) => void;
};

const TABS: { key: OperatorOrderStatus; label: string }[] = [
	{ key: "baru", label: "Baru" },
	{ key: "diproses", label: "Diproses" },
	{ key: "selesai", label: "Selesai" },
];

export default function OperatorTabs({
	activeTab,
	onTabChange,
}: OperatorTabsProps) {
	return (
		<View className="flex-row items-center gap-3">
			{TABS.map((tab) => {
				const isActive = activeTab === tab.key;
				return (
					<Pressable
						key={tab.key}
						onPress={() => onTabChange(tab.key)}
						className={cn(
							"flex-1 items-center justify-center rounded-lg py-2 border active:opacity-85",
							isActive
								? "border-primary bg-primary"
								: "border-primary bg-white",
						)}
					>
						<Text
							size="normal"
							w={isActive ? "bold" : "medium"}
							className={isActive ? "text-white" : "text-primary"}
						>
							{tab.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
