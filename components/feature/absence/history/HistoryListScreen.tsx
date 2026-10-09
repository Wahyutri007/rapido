import { router } from "expo-router";
import { useState } from "react";
import { SectionList, View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import { AbsenceStatus } from "@/components/feature/manage/absence/AbsenceCommon";
import { Button, ButtonText } from "@/components/ui/button";
import { groupAttendanceHistory } from "@/lib/absence-history";
import { attendanceStatus, attendanceTimeLabel } from "@/lib/manage/absence";
import { route, tw } from "@/lib/utils";
import { useAbsenceStore } from "@/store/useAbsenceStore";
import type { AttendanceFilters } from "@/types/ui/manage/absence";
import HistoryNotice from "./HistoryNotice";

const EMPTY_FILTERS: AttendanceFilters = { search: "", status: "all" };
const STATUS_OPTIONS = [
	{ value: "all", label: "Semua Status" },
	{ value: "open", label: "Belum Keluar" },
	{ value: "complete", label: "Masuk & Keluar" },
	{ value: "unknown", label: "Belum Lengkap" },
] satisfies { value: AttendanceFilters["status"]; label: string }[];

export default function HistoryListScreen() {
	const records = useAbsenceStore((state) => state.records);
	const [filters, setFilters] = useState<AttendanceFilters>(EMPTY_FILTERS);
	const sections = groupAttendanceHistory(records, filters);
	const count = sections.reduce(
		(total, section) => total + section.data.length,
		0,
	);
	const stores = [
		...new Set(
			records.map((record) => record.storeName?.trim()).filter(Boolean),
		),
	];
	const filtered =
		!!filters.search ||
		filters.status !== "all" ||
		filters.storeName !== undefined;

	return (
		<Wrapper isNotScrollable py={tw(4)}>
			<View className="flex-1 px-4">
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.id}
					stickySectionHeadersEnabled={false}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 24 }}
					ListHeaderComponent={
						<View className="gap-4 pb-4">
							<SearchBar
								search={filters.search}
								setSearch={(search) =>
									setFilters((current) => ({ ...current, search }))
								}
								placeholder="Cari tanggal, toko, lokasi, atau jam"
								debounce={false}
							/>
							<HistoryNotice />
							<Card density="compact" className="gap-3">
								<Text w="semibold">Filter Riwayat</Text>
								<SingleSelect
									items={STATUS_OPTIONS}
									value={filters.status}
									label="Status Absensi"
									onValueChange={(status) =>
										setFilters((current) => ({ ...current, status }))
									}
								/>
								<SingleSelect
									items={[
										{ value: "all", label: "Semua Toko" },
										...stores.map((name) => ({
											value: `store:${name}`,
											label: name ?? "Toko tidak dicatat",
										})),
									]}
									value={
										filters.storeName === undefined
											? "all"
											: `store:${filters.storeName}`
									}
									label="Toko Absensi"
									onValueChange={(value) =>
										setFilters((current) => ({
											...current,
											storeName: value === "all" ? undefined : value.slice(6),
										}))
									}
								/>
								{filtered && (
									<Button
										variant="outline"
										size="lg"
										onPress={() => setFilters(EMPTY_FILTERS)}
									>
										<ButtonText>Reset Pencarian dan Filter</ButtonText>
									</Button>
								)}
							</Card>
							<Text w="semibold">Catatan Absensi · {count}</Text>
						</View>
					}
					renderSectionHeader={({ section }) => (
						<View className="pb-3 pt-1">
							<Text w="semibold">{section.title}</Text>
						</View>
					)}
					renderItem={({ item }) => (
						<CatalogItemCard
							density="compact"
							title={item.storeName?.trim() || "Toko tidak dicatat"}
							subtitle={item.locationName?.trim() || "Lokasi tidak dicatat"}
							onPress={() =>
								router.push(route("/(absence)/history/detail", { id: item.id }))
							}
						>
							<View className="gap-2">
								<Text size="small" className="text-muted">
									Masuk {attendanceTimeLabel(item.checkIn)} · Keluar{" "}
									{attendanceTimeLabel(item.checkOut)}
								</Text>
								<AbsenceStatus status={attendanceStatus(item)} />
							</View>
						</CatalogItemCard>
					)}
					ItemSeparatorComponent={() => <View className="h-3" />}
					SectionSeparatorComponent={() => <View className="h-4" />}
					ListEmptyComponent={
						<SearchNotFound
							text={
								records.length === 0
									? "Belum ada catatan absensi pada sesi ini."
									: "Tidak ada catatan yang cocok dengan pencarian dan filter."
							}
						/>
					}
				/>
			</View>
		</Wrapper>
	);
}
