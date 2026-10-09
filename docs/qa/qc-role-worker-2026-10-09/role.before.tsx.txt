import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useRolePermissionsQuery,
	useRoleQuery,
	useRoleRequest,
	useRoleUpdateRequest,
} from "@/api/hooks/roles";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import {
	Form,
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import { roleName } from "@/lib/manage/roles";
import { type RoleSchema, roleSchema } from "@/schema/add/role";
import RolePermissionEditor from "./RolePermissionEditor";
import RoleQueryError from "./RoleQueryError";

export default function RoleModifyScreen({ id }: { id?: string }) {
	const role = useRoleQuery(id);
	const permissions = useRolePermissionsQuery();
	const create = useRoleRequest();
	const update = useRoleUpdateRequest(undefined, id);
	const success = useAlertModal();
	const error = useAlertModal();
	const [errorMessage, setErrorMessage] = useState("");
	const hydratedId = useRef<string | undefined>(undefined);
	const form = useForm<RoleSchema>({
		resolver: zodResolver(roleSchema),
		defaultValues: { name: "", permissions: [] },
	});
	useEffect(() => {
		if (id && role.data && hydratedId.current !== id) {
			form.reset({
				name: roleName(role.data),
				permissions: [...role.data.permissions],
			});
			hydratedId.current = id;
		}
	}, [id, role.data, form]);
	const loading = permissions.isLoading || (!!id && role.isLoading);
	const failed =
		permissions.isError || (!!id && (role.isError || (!loading && !role.data)));
	const submitting =
		create.isLoading || update.isLoading || form.formState.isSubmitting;

	async function submit(values: RoleSchema) {
		if (loading || failed || create.isLoading || update.isLoading) return;
		const [, problem] = id
			? await update.call(values)
			: await create.call(values);
		if (problem) {
			// Laravel can return permissions.0; show those errors beside the permission field.
			if (problem.status === 422 && problem.errors) {
				const messages = Object.entries(
					problem.errors as Record<string, string[]>,
				)
					.filter(([key]) => key.startsWith("permissions."))
					.flatMap(([, values]) => values);
				handleFormError(
					{
						...problem,
						errors: {
							...problem.errors,
							...(messages.length ? { permissions: messages } : {}),
						},
					},
					form,
				);
			}
			setErrorMessage(
				problem.status === 422
					? "Mohon periksa nama dan hak akses yang dipilih."
					: "Role belum disimpan. Silakan periksa koneksi dan coba kembali.",
			);
			error.open();
			return;
		}
		success.open();
	}
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				{loading ? (
					<LoadingPlaceholder />
				) : failed ? (
					<RoleQueryError
						message="Data role atau hak akses belum dapat dimuat."
						onRetry={() => {
							void permissions.refetch();
							if (id) void role.refetch();
						}}
					/>
				) : (
					<Card className="gap-4">
						<Form {...form}>
							<View className="gap-4">
								<FormField
									control={form.control}
									name="name"
									render={() => (
										<FormItem>
											<FormLabel required size="body">
												Nama Role
											</FormLabel>
											<FormControl>
												<FormInput
													placeholder="Contoh: Supervisor"
													fieldProps={{
														"aria-label": "Nama Role",
														maxLength: 255,
														editable: !submitting,
													}}
												/>
											</FormControl>
											<FormMessage size="small" />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="permissions"
									render={({ field }) => (
										<FormItem>
											<FormLabel required size="body">
												Role Akses
											</FormLabel>
											<FormControl>
												<RolePermissionEditor
													value={field.value}
													onChange={field.onChange}
													groups={permissions.data ?? {}}
													disabled={submitting}
												/>
											</FormControl>
											<FormMessage size="small" />
										</FormItem>
									)}
								/>
							</View>
						</Form>
					</Card>
				)}
			</Wrapper>
			<BottomActionButton
				onPress={form.handleSubmit(submit)}
				isDisabled={loading || failed || submitting || success.openState[0]}
				isLoading={submitting}
			>
				Simpan
			</BottomActionButton>
			<SuccessModal
				openState={success.openState}
				title={`Role berhasil ${id ? "diubah" : "ditambahkan"}`}
				description="Hak akses role sudah disimpan."
				onClose={() => {
					success.close();
					delayedBack();
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Role belum disimpan"
				message={errorMessage}
				hideCancelButton
				confirmText="Kembali ke form"
			/>
		</>
	);
}
