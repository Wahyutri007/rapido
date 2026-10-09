import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import {
	attendanceStatus,
	attendanceSummary,
	attendanceTimeLabel,
	filterAttendance,
} from "@/lib/manage/absence";
import { route, tw } from "@/lib/utils";
import { useAbsenceStore } from "@/store/useAbsenceStore";
import type { AttendanceFilters } from "@/types/ui/manage/absence";
import { AbsencePreviewNotice, AbsenceStatus } from "./AbsenceCommon";

const EMPTY_FILTERS: AttendanceFilters = { search: "", status: "all" };
const STATUS_OPTIONS = [
	{ value: "all", label: "Semua Status" },
	{ value: "open", label: "Belum Keluar" },
	{ value: "complete", label: "Masuk & Keluar" },
	{ value: "unknown", label: "Belum Lengkap" },
] satisfies { value: AttendanceFilters["status"]; label: string }[];

export default function AbsenceListScreen() {
	const records = useAbsenceStore((state) => state.records);
	const [filters, setFilters] = useState<AttendanceFilters>(EMPTY_FILTERS);
	const visible = filterAttendance(records, filters);
	const summary = attendanceSummary(visible);
	const storeNames = [
		...new Set(
			records
				.map((record) => record.storeName?.trim())
				.filter((name): name is string => !!name),
		),
	];
	const dates = [...new Set(records.map((record) => record.date))];
	const filtered =
		!!filters.search ||
		filters.status !== "all" ||
		filters.storeName !== undefined ||
		filters.date !== undefined;
	return (
		<Wrapper isNotScrollable py={tw(4)}>
			<View className="flex-1 gap-4 px-4">
				<SearchBar
					search={filters.search}
					setSearch={(search) =>
						setFilters((current) => ({ ...current, search }))
					}
					placeholder="Cari toko, tanggal, atau lokasi"
					debounce={false}
				/>
				<FlatList
					data={visible}
					keyExtractor={(record) => record.id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
					ListHeaderComponent={
						<View className="gap-4 pb-4">
							<AbsencePreviewNotice />
							<Card density="compact" className="gap-3">
								<Text w="semibold">Ringkasan Hasil</Text>
								<View className="flex-row gap-3">
									{[
										{ label: "Catatan", value: visible.length },
										{ label: "Belum Keluar", value: summary.open },
										{ label: "Masuk & Keluar", value: summary.complete },
									].map((item) => (
										<View key={item.label} className="flex-1 gap-1">
											<Text size="body" w="bold">
												{item.value}
											</Text>
											<Text size="small" className="text-muted">
												{item.label}
											</Text>
										</View>
									))}
								</View>
							</Card>
							<Card density="compact" className="gap-3">
								<Text w="semibold">Filter Catatan</Text>
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
										...storeNames.map((name) => ({
											value: `store:${name}`,
											label: name,
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
								<SingleSelect
									items={[
										{ value: "all", label: "Semua Tanggal" },
										...dates.map((date) => ({
											value: `date:${date}`,
											label: date || "Tanggal tidak dicatat",
										})),
									]}
									value={
										filters.date === undefined ? "all" : `date:${filters.date}`
									}
									label="Tanggal Absensi"
									onValueChange={(value) =>
										setFilters((current) => ({
											...current,
											date: value === "all" ? undefined : value.slice(5),
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
							<Text w="semibold">Catatan Absensi · {visible.length}</Text>
						</View>
					}
					renderItem={({ item }) => (
						<CatalogItemCard
							density="compact"
							title={item.storeName?.trim() || "Toko tidak dicatat"}
							subtitle={item.date || "Tanggal tidak dicatat"}
							icon={<Feather name="clock" size={20} color={Colors.primary} />}
							onPress={() =>
								router.push(
									route("/(no-layout)/manage/absence/detail", { id: item.id }),
								)
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
					ListEmptyComponent={
						<SearchNotFound
							text={
								records.length === 0
									? "Belum ada catatan absensi."
									: "Tidak ada catatan yang cocok dengan pencarian dan filter."
							}
						/>
					}
				/>
			</View>
		</Wrapper>
	);
}
