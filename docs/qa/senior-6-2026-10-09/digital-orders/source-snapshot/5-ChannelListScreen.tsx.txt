import { router } from "expo-router";
import { useLayoutEffect, useRef, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ManageListActions from "@/components/feature/manage/ManageListActions";
import { EFeather } from "@/components/icons";
import { Button, ButtonText } from "@/components/ui/button";
import { route } from "@/lib/utils";
import { DIGITAL_CHANNEL_KINDS } from "@/schema/manage/digital-order-channel";
import { useDigitalOrderChannelStore } from "@/store/digitalOrderChannelStore";
import type { DigitalOrderChannel } from "@/types/ui/manage/digital-order-channel";
import ChannelDeleteDialog from "./ChannelDeleteDialog";
import ChannelNotice from "./ChannelNotice";

export default function ChannelListScreen() {
	const mounted = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const items = useDigitalOrderChannelStore((state) => state.items);
	const [search, setSearch] = useState("");
	const [kind, setKind] = useState<"all" | DigitalOrderChannel["kind"]>("all");
	const [selection, setSelection] = useState<{
		item: DigitalOrderChannel;
		version: number;
	} | null>(null);
	const current = items.find((item) => item.id === selection?.item.id);
	const selected = current ?? selection?.item;
	const needle = search.trim().toLocaleLowerCase("id-ID");
	const results = items.filter(
		(item) =>
			(kind === "all" || item.kind === kind) &&
			`${item.name} ${item.url} ${item.notes}`
				.toLocaleLowerCase("id-ID")
				.includes(needle),
	);
	function openItem(id: string, page: "detail" | "modify") {
		if (
			mounted.current &&
			useDigitalOrderChannelStore
				.getState()
				.items.some((item) => item.id === id)
		)
			router.push(route(`/manage/pos-settings/digital-orders/${page}`, { id }));
	}
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={16}>
				<View className="flex-1 px-4">
					<FlatList
						data={results}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
						showsVerticalScrollIndicator={false}
						ListHeaderComponent={
							<View className="gap-4 pb-4">
								<ChannelNotice />
								<SearchBar
									search={search}
									setSearch={setSearch}
									debounce={false}
									placeholder="Cari nama, URL, atau catatan kanal"
								/>
								<SingleSelect
									items={[
										{ value: "all", label: "Semua Jenis" },
										...DIGITAL_CHANNEL_KINDS,
									]}
									value={kind}
									label="Jenis Kanal"
									onValueChange={setKind}
								/>
								{(!!search || kind !== "all") && (
									<Button
										variant="outline"
										size="lg"
										onPress={() => {
											setSearch("");
											setKind("all");
										}}
									>
										<ButtonText>Reset Pencarian dan Filter</ButtonText>
									</Button>
								)}
								<Text w="semibold">Kanal Pemesanan · {results.length}</Text>
							</View>
						}
						renderItem={({ item }) => (
							<CatalogItemCard
								density="compact"
								title={item.name}
								subtitle={
									DIGITAL_CHANNEL_KINDS.find(
										(entry) => entry.value === item.kind,
									)?.label
								}
								badge={
									<Text size="small" className="text-muted">
										Draf
									</Text>
								}
								description={item.url}
								onPress={() => openItem(item.id, "detail")}
								right={
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`Tindakan ${item.name}`}
										className="size-11 items-center justify-center"
										onPress={(event) => {
											event.stopPropagation();
											setSelection((previous) => ({
												item,
												version: (previous?.version ?? 0) + 1,
											}));
										}}
									>
										<EFeather
											name="more-vertical"
											size={20}
											className="text-muted"
										/>
									</Pressable>
								}
							/>
						)}
						ListEmptyComponent={
							<SearchNotFound
								text={
									items.length === 0
										? "Belum ada kanal pemesanan. Tambahkan draf kanal pertama Anda."
										: "Tidak ada kanal yang cocok dengan pencarian dan filter."
								}
							/>
						}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => {
					if (mounted.current)
						router.push(route("/manage/pos-settings/digital-orders/modify"));
				}}
			>
				Tambah Kanal Pemesanan
			</BottomActionButton>
			{selection && selected && (
				<ManageListActions
					key={selection.version}
					title={selected.name}
					entityName="Kanal Pemesanan"
					available={!!current}
					onViewDetail={() => openItem(selected.id, "detail")}
					onEdit={() => openItem(selected.id, "modify")}
					renderDelete={(openState) => (
						<ChannelDeleteDialog item={selection.item} openState={openState} />
					)}
				/>
			)}
		</>
	);
}
