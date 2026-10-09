import { router } from "expo-router";
import { useState } from "react";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import { BANK_OPTIONS } from "@/constants/data/other/bank-types";
import { route } from "@/lib/utils";
import { useManagePaymentMethodStore } from "@/store/managePaymentMethodStore";
import ManageFormNotFound from "./ManageFormNotFound";
import PaymentMethodDeleteDialog from "./PaymentMethodDeleteDialog";

export default function PaymentMethodDetailScreen({ id }: { id?: string }) {
	return <PaymentMethodDetailContent key={id ?? ""} id={id} />;
}

function PaymentMethodDetailContent({ id }: { id?: string }) {
	const item = useManagePaymentMethodStore((state) =>
		state.items.find((entry) => entry.id === id),
	);
	const [snapshot, setSnapshot] = useState(item);
	const [open, setOpen] = useState(false);
	if (item && item !== snapshot) setSnapshot(item);
	if (!item && open) setOpen(false);
	const selected = item ?? snapshot;
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
								Data tersedia selama aplikasi terbuka dan belum terhubung ke
								transaksi.
							</Text>
						</Card>
						<Card>
							<DetailRow label="Jenis Pembayaran" value="Transfer Bank" />
							<DetailRow
								label="Tipe Biaya Admin"
								value={
									item.adminType === "percentage" ? "Persentase" : "Nominal"
								}
							/>
							<DetailRow
								label="Nilai Biaya Admin"
								value={
									item.adminType === "percentage"
										? `${item.value}%`
										: new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
											}).format(item.value)
								}
							/>
							<DetailRow
								label="Nama Bank"
								value={
									BANK_OPTIONS.find((option) => option.value === item.bank)
										?.label ?? item.bank
								}
							/>
							<DetailRow label="Nomor Rekening" value={item.accountNumber} />
							<DetailRow
								label="Nama Pemilik Rekening"
								value={item.accountName}
								isLast
							/>
						</Card>
					</Wrapper>
					<DetailBottomActions
						onEdit={() =>
							router.push(
								route("/manage/payment-method/modify", { id: item.id }),
							)
						}
						onDelete={() => setOpen(true)}
					/>
				</>
			) : (
				<ManageFormNotFound
					entity="Metode Pembayaran"
					onBack={() => router.replace("/manage/payment-method")}
				/>
			)}
			{selected && (
				<PaymentMethodDeleteDialog
					item={selected}
					openState={[open, setOpen]}
					onDeleted={() => router.replace("/manage/payment-method")}
				/>
			)}
		</>
	);
}
