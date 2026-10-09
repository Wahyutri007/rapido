import { router } from "expo-router";
import { View } from "react-native";
import { useCustomerQuery } from "@/api/hooks/customers";
import { useAlertModal } from "@/components/common/AlertModal";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import { delayedBack } from "@/components/custom/JSStack";
import { memberDate, memberGender } from "@/lib/manage/members";
import { route } from "@/lib/utils";
import MemberDeleteDialog from "./MemberDeleteDialog";
import MemberIcon from "./MemberIcon";
import MemberQueryError from "./MemberQueryError";

export default function MemberDetailScreen({ id }: { id?: string }) {
	const query = useCustomerQuery(id);
	const deletion = useAlertModal();
	const member = query.data;
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				{!id ? (
					<MemberQueryError
						message="Member belum dipilih."
						onRetry={() => router.back()}
					/>
				) : query.isLoading ? (
					<LoadingPlaceholder />
				) : query.isError || !member ? (
					<MemberQueryError
						message="Detail member belum dapat dimuat."
						onRetry={() => {
							void query.refetch();
						}}
					/>
				) : (
					<>
						<Card density="compact" className="flex-row items-center gap-4">
							<MemberIcon />
							<View className="flex-1 gap-1">
								<Text size="body" w="medium">
									{member.name}
								</Text>
								<Text size="small" className="text-muted">
									{member.phone}
								</Text>
							</View>
						</Card>
						<Card density="compact">
							<DetailRow
								label="Bergabung Sejak"
								value={memberDate(member.created_at)}
								isLast
							/>
						</Card>
						<Card density="compact">
							<Text size="body" w="medium">
								Informasi Pribadi
							</Text>
							<DetailRow label="Nama Lengkap" value={member.name} />
							<DetailRow label="Email" value={member.email} />
							<DetailRow label="No. Telepon" value={member.phone} />
							<DetailRow label="No. KTP" value={member.id_number} />
							<DetailRow
								label="Jenis Kelamin"
								value={memberGender(member.gender)}
							/>
							<DetailRow
								label="Tanggal Lahir"
								value={memberDate(member.date_of_birth)}
							/>
							<DetailRow label="Alamat" value={member.address} isLast />
						</Card>
						<Card density="compact" className="gap-3">
							<Text size="body" w="medium">
								Catatan
							</Text>
							<Text
								size="normal"
								className={member.notes ? "text-foreground" : "text-muted"}
							>
								{member.notes || "Belum ada catatan."}
							</Text>
						</Card>
					</>
				)}
			</Wrapper>
			{member && id && !query.isError && (
				<DetailBottomActions
					onEdit={() => router.push(route("/manage/member/modify", { id }))}
					onDelete={deletion.open}
				/>
			)}
			<MemberDeleteDialog
				member={member ?? null}
				openState={deletion.openState}
				onDeleted={delayedBack}
			/>
		</>
	);
}
