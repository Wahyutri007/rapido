import { router } from "expo-router";
import { View } from "react-native";
import { useWorkersQuery } from "@/api/hooks/workers";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import WorkerAvatar from "@/components/feature/manage/workers/WorkerAvatar";
import { route } from "@/lib/utils";
import RoleQueryError from "./RoleQueryError";

export default function RoleWorkers({ roleId }: { roleId: string }) {
	const query = useWorkersQuery();
	const workers = (query.data ?? []).filter((worker) =>
		worker.roles.some((role) => role.id === roleId),
	);
	return (
		<View className="gap-3">
			<View className="flex-row items-center justify-between">
				<Text size="normal" w="medium">
					Akun yang Terdaftar
				</Text>
				<Text size="small" className="text-muted">
					{query.isLoading
						? "Memuat..."
						: query.isError
							? "Belum tersedia"
							: `${workers.length} akun`}
				</Text>
			</View>
			{query.isLoading ? (
				<LoadingPlaceholder />
			) : query.isError ? (
				<RoleQueryError
					message="Daftar akun role belum dapat dimuat."
					onRetry={() => {
						void query.refetch();
					}}
				/>
			) : workers.length ? (
				workers.map((worker) => (
					<CatalogItemCard
						key={worker.id}
						density="compact"
						leading={<WorkerAvatar uri={worker.worker_profile?.face_scan} />}
						title={
							<Text size="normal" w="medium">
								{worker.name}
							</Text>
						}
						subtitle={
							<Text size="small" className="text-muted">
								{worker.assigned_store?.name ?? worker.email}
							</Text>
						}
						onPress={() =>
							router.push(
								route("/(no-layout)/manage/workers/detail", { id: worker.id }),
								{ withAnchor: true },
							)
						}
					/>
				))
			) : (
				<Text size="normal" className="text-muted">
					Belum ada karyawan yang menggunakan role ini.
				</Text>
			)}
		</View>
	);
}
