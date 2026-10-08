import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";

type ExampleItemProps = {
	title: string;
	original: string;
	rounded: string;
	isLast?: boolean;
};

function ExampleItem({
	title,
	original,
	rounded,
	isLast = false,
}: ExampleItemProps) {
	return (
		<View className={`py-3 ${!isLast ? "border-b border-gray-100" : ""}`}>
			<Text size="normal" w="semibold" className="text-foreground">
				{title}
			</Text>
			<View className="mt-2 flex-row items-center justify-between">
				<Text size="small" className="text-muted">
					Total Asli
				</Text>
				<Text size="small" w="medium" className="text-foreground">
					{original}
				</Text>
			</View>
			<View className="mt-1 flex-row items-center justify-between">
				<Text size="small" w="semibold" className="text-primary">
					Hasil Pembulatan
				</Text>
				<Text size="small" w="bold" className="text-primary">
					{rounded}
				</Text>
			</View>
		</View>
	);
}

export default function RoundingDetailScreen() {
	return (
		<Wrapper className="gap-5 px-4 pt-4 pb-8">
			{/* Section: Contoh Pembulatan Ratusan */}
			<View className="gap-2">
				<Text size="normal" w="semibold" className="text-foreground">
					Contoh Pembulatan Ratusan
				</Text>
				<Card className="p-3">
					<ExampleItem
						title="Pembulatan Keatas"
						original="Rp12.470"
						rounded="Rp12.500"
					/>
					<ExampleItem
						title="Pembulatan Kebawah"
						original="Rp12.470"
						rounded="Rp12.400"
					/>
					<ExampleItem
						title="Pembulatan Terdekat"
						original="Rp12.470"
						rounded="Rp12.500"
						isLast
					/>
				</Card>
			</View>

			{/* Section: Contoh Pembulatan Ribuan */}
			<View className="gap-2">
				<Text size="normal" w="semibold" className="text-foreground">
					Contoh Pembulatan Ribuan
				</Text>
				<Card className="p-3">
					<ExampleItem
						title="Pembulatan Keatas"
						original="Rp12.470"
						rounded="Rp13.000"
					/>
					<ExampleItem
						title="Pembulatan Kebawah"
						original="Rp12.470"
						rounded="Rp12.000"
					/>
					<ExampleItem
						title="Pembulatan Terdekat"
						original="Rp12.470"
						rounded="Rp12.000"
						isLast
					/>
				</Card>
			</View>
		</Wrapper>
	);
}
