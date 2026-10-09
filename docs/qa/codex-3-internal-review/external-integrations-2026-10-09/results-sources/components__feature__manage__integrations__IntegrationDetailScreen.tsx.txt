import { router } from "expo-router";
import { useLayoutEffect, useRef, useState } from "react";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import ManageFormNotFound from "@/components/feature/manage/settings/ManageFormNotFound";
import { route } from "@/lib/utils";
import { useManageIntegrationStore } from "@/store/manageIntegrationStore";
import IntegrationDeleteDialog from "./IntegrationDeleteDialog";

export default function IntegrationDetailScreen({ id }: { id?: string }) {
	return <IntegrationDetailContent key={id ?? ""} id={id} />;
}

function IntegrationDetailContent({ id }: { id?: string }) {
	const item = useManageIntegrationStore((state) =>
		state.items.find((entry) => entry.id === id),
	);
	const [snapshot, setSnapshot] = useState(item);
	const [open, setOpen] = useState(false);
	const mounted = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	if (item && item !== snapshot) setSnapshot(item);
	if (!item && open) setOpen(false);
	const selected = item ?? snapshot;
	function available() {
		return (
			mounted.current &&
			useManageIntegrationStore
				.getState()
				.items.some((entry) => entry.id === id)
		);
	}
	return (
		<>
			{item ? (
				<>
					<Wrapper
						hasActionButton
						contentContainerStyle={{ padding: 16, gap: 16 }}
					>
						<Card className="gap-4">
							<Text size="body" w="semibold">
								{item.name}
							</Text>
							<Text size="small" className="text-muted">
								Draf tersedia selama aplikasi terbuka. Integrasi belum aktif dan
								tidak mengirim data.
							</Text>
						</Card>
						<Card>
							<DetailRow label="Status" value="Draf" />
							<DetailRow label="URL Tujuan Webhook" value={item.endpoint} />
							<DetailRow
								label="Catatan"
								value={item.notes || "Tidak ada catatan"}
								isLast
							/>
						</Card>
					</Wrapper>
					<DetailBottomActions
						onEdit={() => {
							if (available())
								router.push(
									route("/manage/integrations/modify", { id: item.id }),
								);
						}}
						onDelete={() => {
							if (available()) setOpen(true);
						}}
					/>
				</>
			) : (
				<ManageFormNotFound
					entity="Integrasi"
					onBack={() => router.replace(route("/manage/integrations"))}
				/>
			)}
			{selected && (
				<IntegrationDeleteDialog
					item={selected}
					openState={[open, setOpen]}
					onDeleted={() => router.replace(route("/manage/integrations"))}
				/>
			)}
		</>
	);
}
