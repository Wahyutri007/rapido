import { router } from "expo-router";
import { Fragment, useState } from "react";
import { View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { EEntypo } from "@/components/icons";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { CASHIER_SCANNER_PREVIEW } from "@/constants/data/cashier-scanner-preview";
import {
	scannerPreviewGroups,
	scannerStatusLabel,
} from "@/lib/cashier/scanner";
import { route } from "@/lib/utils";

export default function CashierScannerScreen() {
	const [search, setSearch] = useState("");
	const groups = scannerPreviewGroups(CASHIER_SCANNER_PREVIEW, search);
	const hasResults = groups.some((group) => group.devices.length > 0);

	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<SearchBar
				appearance="figma"
				search={search}
				setSearch={setSearch}
				placeholder="Cari scanner"
			/>
			{hasResults ? (
				groups.map((group) => (
					<View key={group.status} className="gap-2">
						<Text size="normal" w="medium" accessibilityRole="header">
							{group.title}
						</Text>
						{group.devices.length ? (
							<Card
								appearance="figma"
								density="flush"
								className="overflow-hidden"
							>
								{group.devices.map((device, index) => (
									<Fragment key={device.id}>
										{index > 0 && (
											<View className="mx-3 h-px bg-border-muted" />
										)}
										<BouncyPressable
											ripple
											hitSlop={4}
											className="flex-row items-center gap-3 px-3 py-3"
											accessibilityRole="button"
											accessibilityLabel={`${device.name}, contoh status ${scannerStatusLabel(device.status)}`}
											onPress={() =>
												router.push(
													route("/(no-layout)/(cashier)/scanner/detail", {
														id: device.id,
													}),
												)
											}
										>
											<Text size="normal" className="min-w-0 flex-1 shrink">
												{device.name}
											</Text>
											<EEntypo
												name="chevron-right"
												size={12}
												color={Colors.zinc[400]}
											/>
										</BouncyPressable>
									</Fragment>
								))}
							</Card>
						) : (
							<Text size="small" className="text-muted">
								Tidak ada contoh scanner yang cocok di bagian ini.
							</Text>
						)}
					</View>
				))
			) : (
				<SearchNotFound text="Contoh scanner tidak ditemukan" />
			)}
			{search.length > 0 && (
				<Button variant="outline" onPress={() => setSearch("")}>
					<ButtonText>Reset pencarian</ButtonText>
				</Button>
			)}
			<Text size="small" className="text-muted">
				Daftar dan status di atas adalah contoh desain. Pembacaan perangkat
				serta pemasangan scanner belum tersedia.
			</Text>
		</Wrapper>
	);
}
