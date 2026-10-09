import { router, useLocalSearchParams } from "expo-router";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { Button, ButtonText } from "@/components/ui/button";
import { cashierPlaceKind, findCashierPlace } from "@/lib/cashier/location";
import { route } from "@/lib/utils";
import { usePlaceStore } from "@/store/placeStore";
import { LocationPreviewNotice, LocationStatus } from "./LocationCommon";

export default function CashierLocationDetailScreen() {
	const { outletId, areaId, placeId } = useLocalSearchParams<{
		outletId?: string | string[];
		areaId?: string | string[];
		placeId?: string | string[];
	}>();
	const outlets = usePlaceStore((state) => state.outlets);
	const record = findCashierPlace(outlets, outletId, areaId, placeId);
	if (!record)
		return (
			<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text w="semibold">Tempat tidak ditemukan.</Text>
					<Text size="small" className="text-muted">
						Tempat mungkin sudah dihapus atau tidak berada di outlet dan area
						yang dipilih.
					</Text>
					<Button
						size="xl"
						onPress={() =>
							router.replace(
								route(
									"/(cashier)/location",
									typeof outletId === "string" &&
										outlets.some((item) => item.id === outletId)
										? { outletId }
										: {},
								),
							)
						}
					>
						<ButtonText>Kembali ke Daftar Tempat</ButtonText>
					</Button>
				</Card>
			</Wrapper>
		);
	const kind = cashierPlaceKind(record.place);
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<LocationPreviewNotice />
			<Card className="gap-4">
				<Text w="semibold">{record.place.name}</Text>
				<LocationStatus active={record.active} />
				<DetailRow label="Outlet" value={record.outlet.name} />
				<DetailRow label="Area" value={record.area.name} />
				<DetailRow label="Jenis" value={kind?.label} />
				<DetailRow
					label="Kapasitas"
					value={`${record.place.capacity} ${kind?.unit ?? ""}`}
					isLast
				/>
			</Card>
			<Card className="gap-2">
				<Text size="normal" w="semibold">
					Status Tempat
				</Text>
				<Text size="small" className="text-muted">
					{!record.outlet.active
						? "Outlet nonaktif, sehingga tempat ini juga nonaktif."
						: !record.place.active
							? "Tempat dinonaktifkan pada pengaturan tempat."
							: "Tempat diaktifkan pada pengaturan tempat."}{" "}
					Status ini belum menunjukkan meja kosong, terisi, atau reservasi.
				</Text>
			</Card>
		</Wrapper>
	);
}
