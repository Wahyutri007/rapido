import { router } from "expo-router";
import { useLayoutEffect, useRef, useState } from "react";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import ManageFormNotFound from "@/components/feature/manage/settings/ManageFormNotFound";
import { route } from "@/lib/utils";
import { DIGITAL_CHANNEL_KINDS } from "@/schema/manage/digital-order-channel";
import { useDigitalOrderChannelStore } from "@/store/digitalOrderChannelStore";
import type { DigitalOrderChannel } from "@/types/ui/manage/digital-order-channel";
import ChannelDeleteDialog from "./ChannelDeleteDialog";
import ChannelNotice from "./ChannelNotice";

export default function ChannelDetailScreen({ id }: { id?: string }) {
	return <DetailSession key={id ?? "missing"} id={id} />;
}

function DetailSession({ id }: { id?: string }) {
	const mounted = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const item = useDigitalOrderChannelStore((state) =>
		state.items.find((entry) => entry.id === id),
	);
	const [target, setTarget] = useState<DigitalOrderChannel>();
	const [open, setOpen] = useState(false);
	const [version, setVersion] = useState(0);
	return (
		<>
			{item ? (
				<>
					<Wrapper
						hasActionButton
						contentContainerStyle={{ padding: 16, gap: 16 }}
					>
						<ChannelNotice />
						<Card className="gap-3">
							<Text size="body" w="semibold">
								{item.name}
							</Text>
							<DetailRow label="Status" value="Draf" />
							<DetailRow
								label="Jenis Kanal"
								value={
									DIGITAL_CHANNEL_KINDS.find(
										(entry) => entry.value === item.kind,
									)?.label
								}
							/>
							<DetailRow label="URL Pemesanan" value={item.url} />
							<DetailRow
								label="Catatan"
								value={item.notes || "Tidak ada catatan"}
								isLast
							/>
						</Card>
					</Wrapper>
					<DetailBottomActions
						onEdit={() => {
							if (
								mounted.current &&
								useDigitalOrderChannelStore
									.getState()
									.items.some((entry) => entry.id === id)
							)
								router.push(
									route("/manage/pos-settings/digital-orders/modify", {
										id: item.id,
									}),
								);
						}}
						onDelete={() => {
							if (!mounted.current) return;
							const latest = useDigitalOrderChannelStore
								.getState()
								.items.find((entry) => entry.id === id);
							if (latest) {
								setTarget(latest);
								setVersion((previous) => previous + 1);
								setOpen(true);
							}
						}}
					/>
				</>
			) : (
				<ManageFormNotFound
					entity="Kanal Pemesanan"
					onBack={() =>
						router.dismissTo(route("/manage/pos-settings/digital-orders"))
					}
				/>
			)}
			{target && (
				<ChannelDeleteDialog
					key={version}
					item={target}
					openState={[open && !!item, setOpen]}
					onDeleted={() =>
						router.dismissTo(route("/manage/pos-settings/digital-orders"))
					}
				/>
			)}
		</>
	);
}
