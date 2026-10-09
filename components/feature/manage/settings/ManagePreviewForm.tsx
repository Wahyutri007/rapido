import type { PropsWithChildren } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { Form } from "@/components/common/Form";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";

export default function ManagePreviewForm<T extends FieldValues>({
	form,
	title,
	children,
}: PropsWithChildren<{ form: UseFormReturn<T>; title: string }>) {
	const result = useAlertModal();
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text size="small" className="text-muted">
						Pratinjau {title.toLowerCase()}. Perubahan belum disimpan.
					</Text>
					<Form {...form}>{children}</Form>
				</Card>
			</Wrapper>
			<BottomActionButton
				onPress={form.handleSubmit(() => result.open())}
				isDisabled={form.formState.isSubmitting}
			>
				Periksa Data
			</BottomActionButton>
			<AlertModal
				openState={result.openState}
				title={`Data ${title.toLowerCase()} valid`}
				message="Data form telah diperiksa. Perubahan pada pratinjau ini belum disimpan."
				hideCancelButton
				confirmText="Kembali ke form"
			/>
		</>
	);
}
