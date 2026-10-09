import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { type Control, useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import { useRolesQuery } from "@/api/hooks/roles";
import { useStoresQuery } from "@/api/hooks/stores";
import {
	useWorkerQuery,
	useWorkerRequest,
	useWorkerUpdateRequest,
} from "@/api/hooks/workers";
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
	FormSelect,
} from "@/components/common/Form";
import ImageUploader from "@/components/common/ImageUploader";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import { Button, ButtonText } from "@/components/ui/button";
import { roleName } from "@/lib/manage/roles";
import {
	WORKER_DEFAULTS,
	workerFormData,
	workerFormValues,
} from "@/lib/manage/workers";
import { route } from "@/lib/utils";
import { type WorkerSchema, workerSchema } from "@/schema/add/worker";
import WorkerQueryError from "./WorkerQueryError";

type TextFieldName = Exclude<
	keyof WorkerSchema,
	"role_id" | "store_id" | "face_scan" | "id_scan"
>;
function WorkerTextField({
	control,
	name,
	label,
	placeholder,
	required,
	disabled,
	type,
}: {
	control: Control<WorkerSchema>;
	name: TextFieldName;
	label: string;
	placeholder: string;
	required?: boolean;
	disabled: boolean;
	type?: "password";
}) {
	return (
		<FormField
			control={control}
			name={name}
			render={() => (
				<FormItem>
					<FormLabel required={required} size="body">
						{label}
					</FormLabel>
					<FormControl>
						<FormInput
							type={type}
							placeholder={placeholder}
							fieldProps={{
								keyboardType:
									name === "email"
										? "email-address"
										: name === "phone"
											? "phone-pad"
											: "default",
								"aria-label": label,
								accessibilityLabel: label,
								editable: !disabled,
								autoCapitalize: name === "email" ? "none" : undefined,
								maxLength:
									name === "address" ? 500 : name === "phone" ? 50 : 255,
							}}
						/>
					</FormControl>
					<FormMessage size="small" />
				</FormItem>
			)}
		/>
	);
}

export default function WorkerModifyScreen({ id }: { id?: string }) {
	return (
		<WorkerModifyForm
			key={id === undefined ? "create" : `edit:${id}`}
			id={id}
		/>
	);
}

function WorkerModifyForm({ id }: { id?: string }) {
	const isEditing = id !== undefined;
	const worker = useWorkerQuery(id);
	const roles = useRolesQuery();
	const stores = useStoresQuery();
	const create = useWorkerRequest();
	const update = useWorkerUpdateRequest(undefined, id);
	const success = useAlertModal();
	const error = useAlertModal();
	const [errorMessage, setErrorMessage] = useState("");
	const hydrated = useRef<string | undefined>(undefined);
	const mounted = useRef(true);
	const pending = useRef(false);
	const saved = useRef(false);
	const [isSaved, setIsSaved] = useState(false);
	const form = useForm<WorkerSchema>({
		resolver: zodResolver(workerSchema(isEditing)),
		defaultValues: WORKER_DEFAULTS,
	});
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	useEffect(() => {
		if (id && worker.data && hydrated.current !== id) {
			form.reset(workerFormValues(worker.data));
			hydrated.current = id;
		}
	}, [id, worker.data, form]);
	const loading =
		roles.isLoading || stores.isLoading || (isEditing && worker.isLoading);
	const failed =
		roles.isError ||
		stores.isError ||
		(isEditing && (worker.isError || (!loading && !worker.data)));
	const noRoles = !loading && !failed && !roles.data?.length;
	const noStores = !loading && !failed && !stores.data?.length;
	const submitting =
		form.formState.isSubmitting || create.isLoading || update.isLoading;
	async function submit(values: WorkerSchema) {
		if (
			!mounted.current ||
			pending.current ||
			saved.current ||
			loading ||
			failed ||
			noRoles ||
			noStores ||
			create.isLoading ||
			update.isLoading
		)
			return;
		pending.current = true;
		try {
			const payload = await workerFormData(values, isEditing);
			if (!mounted.current) return;
			const [, problem] = isEditing
				? await update.call(payload)
				: await create.call(payload);
			if (!mounted.current) return;
			if (problem) {
				handleFormError(problem, form);
				setErrorMessage(
					problem.status === 422
						? "Mohon periksa kembali data karyawan."
						: "Data belum disimpan. Silakan periksa koneksi dan coba kembali.",
				);
				error.open();
				return;
			}
			saved.current = true;
			setIsSaved(true);
			success.open();
		} catch {
			if (!mounted.current) return;
			setErrorMessage(
				"Gambar tidak dapat dibaca. Pilih gambar kembali dan coba simpan.",
			);
			error.open();
		} finally {
			pending.current = false;
		}
	}
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				{loading ? (
					<LoadingPlaceholder />
				) : failed ? (
					<WorkerQueryError
						message="Data karyawan, role, atau toko belum dapat dimuat."
						onRetry={() => {
							void roles.refetch();
							void stores.refetch();
							if (id) void worker.refetch();
						}}
					/>
				) : noRoles || noStores ? (
					<Card className="gap-4">
						<Text size="body" w="medium">
							{noRoles
								? "Buat role terlebih dahulu"
								: "Tambahkan toko terlebih dahulu"}
						</Text>
						<Text size="normal" className="text-muted">
							Karyawan memerlukan satu role dan satu toko untuk dapat
							menggunakan aplikasi.
						</Text>
						<Button
							onPress={() =>
								router.push(
									route(
										noRoles ? "/manage/roles/modify" : "/manage/store/modify",
									),
								)
							}
						>
							<ButtonText>{noRoles ? "Tambah Role" : "Tambah Toko"}</ButtonText>
						</Button>
					</Card>
				) : (
					<Card density="compact">
						<Form {...form}>
							<View className="gap-4">
								<WorkerTextField
									control={form.control}
									name="name"
									label="Nama Lengkap"
									placeholder="Contoh: Budi Setiawan"
									required
									disabled={submitting}
								/>
								<FormField
									control={form.control}
									name="role_id"
									render={() => (
										<FormItem>
											<FormLabel required size="body">
												Role
											</FormLabel>
											<FormControl>
												<FormSelect
													label="Pilih Role"
													placeholder="Pilih role karyawan"
													data={(roles.data ?? []).map((role) => ({
														value: role.id,
														label: roleName(role),
													}))}
													disabled={submitting}
												/>
											</FormControl>
											<FormMessage size="small" />
										</FormItem>
									)}
								/>
								{(worker.data?.roles.length ?? 0) > 1 && (
									<Text size="small" className="text-warning">
										Karyawan ini memiliki beberapa role. Penyimpanan akan
										menggunakan satu role yang dipilih.
									</Text>
								)}
								<WorkerTextField
									control={form.control}
									name="phone"
									label="Nomor Telepon"
									placeholder="Contoh: 081234567890"
									required
									disabled={submitting}
								/>
								<WorkerTextField
									control={form.control}
									name="email"
									label="Alamat Email"
									placeholder="Contoh: budi@email.com"
									required
									disabled={submitting}
								/>
								<WorkerTextField
									control={form.control}
									name="address"
									label="Alamat Singkat"
									placeholder="Masukkan alamat karyawan"
									disabled={submitting}
								/>
								<WorkerTextField
									control={form.control}
									name="date_of_birth"
									label="Tanggal Lahir"
									placeholder="YYYY-MM-DD, contoh: 1998-05-17"
									disabled={submitting}
								/>
								{!id && (
									<>
										<WorkerTextField
											control={form.control}
											name="password"
											label="Password"
											placeholder="Minimal 8 karakter"
											type="password"
											required
											disabled={submitting}
										/>
										<WorkerTextField
											control={form.control}
											name="password_confirmation"
											label="Konfirmasi Password"
											placeholder="Ulangi password"
											type="password"
											required
											disabled={submitting}
										/>
									</>
								)}
								{(
									[
										{
											name: "face_scan",
											label: "Foto Karyawan",
											title: "Pilih foto karyawan",
										},
										{
											name: "id_scan",
											label: "Scan KTP",
											title: "Pilih scan KTP",
										},
									] as const
								).map(({ name, label, title }) => (
									<FormField
										key={name}
										control={form.control}
										name={name}
										render={({ field }) => (
											<FormItem>
												<FormLabel size="body">{label}</FormLabel>
												<FormControl>
													<ImageUploader
														value={field.value}
														onChange={(asset) =>
															field.onChange(
																asset ??
																	worker.data?.worker_profile?.[name] ??
																	null,
															)
														}
														title={title}
														subtitle="PNG, JPG, WebP maks. 2 MB"
														disabled={submitting}
														removable={typeof field.value !== "string"}
													/>
												</FormControl>
												<FormMessage size="small" />
											</FormItem>
										)}
									/>
								))}
								<FormField
									control={form.control}
									name="store_id"
									render={() => (
										<FormItem>
											<FormLabel required size="body">
												Toko
											</FormLabel>
											<FormControl>
												<FormSelect
													label="Pilih Toko"
													placeholder="Pilih toko karyawan"
													data={(stores.data ?? []).map((store) => ({
														value: store.id,
														label: store.name,
													}))}
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
				onPress={() => form.handleSubmit(submit)()}
				isLoading={submitting}
				isDisabled={
					loading ||
					failed ||
					noRoles ||
					noStores ||
					submitting ||
					isSaved ||
					success.openState[0]
				}
			>
				Simpan
			</BottomActionButton>
			<SuccessModal
				openState={success.openState}
				title={`Karyawan berhasil ${id ? "diubah" : "ditambahkan"}`}
				description="Data akun, role, dan toko karyawan sudah disimpan."
				onClose={() => {
					success.close();
					delayedBack();
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Karyawan belum disimpan"
				message={errorMessage}
				hideCancelButton
				confirmText="Kembali ke form"
			/>
		</>
	);
}
