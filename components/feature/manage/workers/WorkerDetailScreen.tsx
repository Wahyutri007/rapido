import { router } from "expo-router";
import { Image, View } from "react-native";
import { useWorkerQuery } from "@/api/hooks/workers";
import { useAlertModal } from "@/components/common/AlertModal";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import { delayedBack } from "@/components/custom/JSStack";
import { workerDate, workerRoleName } from "@/lib/manage/workers";
import { route } from "@/lib/utils";
import WorkerAvatar from "./WorkerAvatar";
import WorkerDeleteDialog from "./WorkerDeleteDialog";
import WorkerQueryError from "./WorkerQueryError";

export default function WorkerDetailScreen({ id }: { id?: string }) {
	return <WorkerDetailContent key={id ?? ""} id={id} />;
}

function WorkerDetailContent({ id }: { id?: string }) {
	const query = useWorkerQuery(id);
	const deletion = useAlertModal();
	const worker = query.data;
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				{!id ? (
					<WorkerQueryError
						message="Karyawan belum dipilih."
						onRetry={() => router.back()}
					/>
				) : query.isLoading ? (
					<LoadingPlaceholder />
				) : query.isError || !worker ? (
					<WorkerQueryError
						message="Detail karyawan belum dapat dimuat."
						onRetry={() => {
							void query.refetch();
						}}
					/>
				) : (
					<>
						<Card density="compact" className="flex-row items-center gap-4">
							<WorkerAvatar uri={worker.worker_profile?.face_scan} />
							<View className="flex-1 gap-1">
								<Text size="body" w="medium">
									{worker.name}
								</Text>
								<Text size="small" className="text-muted">
									{worker.email}
								</Text>
							</View>
						</Card>
						<Card density="compact">
							<Text size="body" w="medium">
								Informasi Pribadi
							</Text>
							<DetailRow label="Nama Lengkap" value={worker.name} />
							<DetailRow label="Email" value={worker.email} />
							<DetailRow label="No. Telepon" value={worker.phone} />
							<DetailRow label="Role" value={workerRoleName(worker)} />
							<DetailRow
								label="Tanggal Lahir"
								value={workerDate(worker.worker_profile?.date_of_birth)}
							/>
							<DetailRow
								label="Alamat"
								value={worker.worker_profile?.address}
								isLast
							/>
						</Card>
						<Card density="compact">
							<Text size="body" w="medium">
								Informasi Akun
							</Text>
							<DetailRow
								label="Bergabung Sejak"
								value={workerDate(worker.created_at)}
								isLast
							/>
						</Card>
						<Card density="compact" className="gap-3">
							<Text size="body" w="medium">
								Toko yang Ditugaskan
							</Text>
							<Text size="normal" w="medium">
								{worker.assigned_store?.name ?? "Toko belum ditetapkan"}
							</Text>
							{worker.assigned_store && (
								<Text size="small" className="text-muted">
									{worker.assigned_store.address}
								</Text>
							)}
						</Card>
						{worker.worker_profile?.id_scan && (
							<Card density="compact" className="gap-3">
								<Text size="body" w="medium">
									Scan KTP
								</Text>
								<Image
									source={{ uri: worker.worker_profile.id_scan }}
									className="h-48 w-full rounded-lg"
									resizeMode="contain"
									accessibilityLabel="Scan KTP karyawan"
								/>
							</Card>
						)}
					</>
				)}
			</Wrapper>
			{worker && id && !query.isError && (
				<DetailBottomActions
					onEdit={() => router.push(route("/manage/workers/modify", { id }))}
					onDelete={deletion.open}
				/>
			)}
			<WorkerDeleteDialog
				worker={worker ?? null}
				openState={deletion.openState}
				onDeleted={delayedBack}
			/>
		</>
	);
}
