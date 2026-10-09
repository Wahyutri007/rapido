import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { type Control, useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useCustomerQuery,
	useCustomerRequest,
	useCustomerUpdateRequest,
} from "@/api/hooks/customers";
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
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import {
	MEMBER_DEFAULTS,
	MEMBER_GENDERS,
	memberFormValues,
	memberPayload,
} from "@/lib/manage/members";
import { type CustomerSchema, customerSchema } from "@/schema/add/customer";
import MemberQueryError from "./MemberQueryError";

type MemberTextFieldProps = {
	control: Control<CustomerSchema>;
	name: Exclude<keyof CustomerSchema, "gender">;
	label: string;
	placeholder: string;
	required?: boolean;
	disabled: boolean;
	maxLength?: number;
	multiline?: boolean;
};
function MemberTextField({
	control,
	name,
	label,
	placeholder,
	required,
	disabled,
	maxLength,
	multiline,
}: MemberTextFieldProps) {
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
							placeholder={placeholder}
							multiline={multiline}
							fieldProps={{
								"aria-label": label,
								accessibilityLabel: label,
								editable: !disabled,
								maxLength,
								keyboardType:
									name === "email"
										? "email-address"
										: name === "phone"
											? "phone-pad"
											: "default",
								autoCapitalize: name === "email" ? "none" : undefined,
							}}
						/>
					</FormControl>
					<FormMessage size="small" />
				</FormItem>
			)}
		/>
	);
}

export default function MemberModifyScreen({ id }: { id?: string }) {
	return (
		<MemberModifyForm
			key={id === undefined ? "create" : `edit:${id}`}
			id={id}
		/>
	);
}

function MemberModifyForm({ id }: { id?: string }) {
	const query = useCustomerQuery(id);
	const create = useCustomerRequest();
	const update = useCustomerUpdateRequest(undefined, id);
	const success = useAlertModal();
	const error = useAlertModal();
	const [errorMessage, setErrorMessage] = useState("");
	const [saved, setSaved] = useState(false);
	const hydrated = useRef<string | undefined>(undefined);
	const mounted = useRef(true);
	const form = useForm<CustomerSchema>({
		resolver: zodResolver(customerSchema),
		defaultValues: MEMBER_DEFAULTS,
	});
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	useEffect(() => {
		if (id && query.data && hydrated.current !== id) {
			form.reset(memberFormValues(query.data));
			hydrated.current = id;
		}
	}, [id, query.data, form]);
	const loading = !!id && query.isLoading;
	const failed = !!id && (query.isError || (!loading && !query.data));
	const submitting =
		form.formState.isSubmitting || create.isLoading || update.isLoading;
	async function submit(values: CustomerSchema) {
		if (loading || failed || saved || create.isLoading || update.isLoading)
			return;
		const payload = memberPayload(values);
		const [, problem] = id
			? await update.call(payload)
			: await create.call(payload);
		if (!mounted.current) return;
		if (problem) {
			handleFormError(problem, form);
			setErrorMessage(
				problem.status === 422
					? "Mohon periksa kembali data member."
					: "Data belum disimpan. Silakan periksa koneksi dan coba kembali.",
			);
			error.open();
			return;
		}
		setSaved(true);
		success.open();
	}
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				{loading ? (
					<LoadingPlaceholder />
				) : failed ? (
					<MemberQueryError
						message="Data member belum dapat dimuat."
						onRetry={() => {
							void query.refetch();
						}}
					/>
				) : (
					<Card density="compact">
						<Form {...form}>
							<View className="gap-4">
								<MemberTextField
									control={form.control}
									name="name"
									label="Nama Lengkap"
									placeholder="Contoh: Budi Setiawan"
									required
									disabled={submitting || saved}
									maxLength={255}
								/>
								<MemberTextField
									control={form.control}
									name="phone"
									label="Nomor Telepon"
									placeholder="Contoh: 081234567890"
									required
									disabled={submitting || saved}
									maxLength={50}
								/>
								<MemberTextField
									control={form.control}
									name="email"
									label="Alamat Email"
									placeholder="Contoh: budi@email.com"
									disabled={submitting || saved}
									maxLength={255}
								/>
								<MemberTextField
									control={form.control}
									name="id_number"
									label="No. KTP"
									placeholder="Masukkan nomor KTP"
									disabled={submitting || saved}
									maxLength={100}
								/>
								<MemberTextField
									control={form.control}
									name="address"
									label="Alamat Singkat"
									placeholder="Masukkan alamat member"
									disabled={submitting || saved}
									maxLength={255}
								/>
								<MemberTextField
									control={form.control}
									name="date_of_birth"
									label="Tanggal Lahir"
									placeholder="YYYY-MM-DD, contoh: 1998-05-17"
									disabled={submitting || saved}
								/>
								<FormField
									control={form.control}
									name="gender"
									render={() => (
										<FormItem>
											<FormLabel size="body">Jenis Kelamin</FormLabel>
											<FormControl>
												<FormSelect
													label="Pilih Jenis Kelamin"
													placeholder="Belum dipilih"
													data={MEMBER_GENDERS}
													disabled={submitting || saved}
												/>
											</FormControl>
											<FormMessage size="small" />
										</FormItem>
									)}
								/>
								<MemberTextField
									control={form.control}
									name="notes"
									label="Catatan"
									placeholder="Tambahkan catatan tentang member"
									disabled={submitting || saved}
									multiline
								/>
							</View>
						</Form>
					</Card>
				)}
			</Wrapper>
			<BottomActionButton
				onPress={() => form.handleSubmit(submit)()}
				isLoading={submitting}
				isDisabled={loading || failed || submitting || saved}
			>
				Simpan
			</BottomActionButton>
			<SuccessModal
				openState={success.openState}
				title={`Member berhasil ${id ? "diubah" : "ditambahkan"}`}
				description="Data member sudah disimpan."
				onClose={() => {
					success.close();
					delayedBack();
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Member belum disimpan"
				message={errorMessage}
				hideCancelButton
				confirmText="Kembali ke form"
			/>
		</>
	);
}
