import type { UseFormReturn } from "react-hook-form";
import { View } from "react-native";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetHeader,
	ActionsheetHeaderTitle,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import type { StoreSchema } from "@/schema/manage/store";
import type { State } from "@/types";

type StoreActionConfirmationProps = {
	onConfirm: () => void;
	openState: State<boolean>;
	form: UseFormReturn<StoreSchema>;
};

function ConfirmItem({ label, value }: { label: string; value?: string }) {
	return (
		<View className="gap-1">
			<Text size="small" className="text-muted" w="medium">
				{label}
			</Text>
			<Text size="normal" className="text-foreground" w="semibold">
				{value?.trim() ? value : "-"}
			</Text>
		</View>
	);
}

export default function StoreActionConfirmation(
	props: StoreActionConfirmationProps,
) {
	const { onConfirm, openState, form } = props;
	const [open, setOpen] = openState;

	const values = form.getValues();

	return (
		<Actionsheet isOpen={open} onClose={() => setOpen(false)}>
			<ActionsheetBackdrop />

			<ActionsheetContent className="bg-surface px-5 pb-8 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				<ActionsheetHeader>
					<ActionsheetHeaderTitle>Data Toko</ActionsheetHeaderTitle>
				</ActionsheetHeader>

				<View className="mt-4 w-full gap-3.5">
					<ConfirmItem label="Nama Toko" value={values.name} />
					<ConfirmItem
						label="Nomor HP Toko"
						value={
							values.phone
								? values.phone.startsWith("+62") || values.phone.startsWith("0")
									? values.phone
									: `+62 ${values.phone}`
								: "-"
						}
					/>
					<ConfirmItem label="Jenis Usaha" value={values.business_type} />
					<ConfirmItem label="Provinsi" value={values.province} />
					<ConfirmItem label="Kota" value={values.city} />
					<ConfirmItem label="Kecamatan" value={values.district} />
					<ConfirmItem label="Alamat Toko" value={values.address} />
					<ConfirmItem label="Kode Pos" value={values.postal_code} />
				</View>

				<View className="mt-8 w-full flex-row gap-3">
					<ButtonGroup className="flex-1">
						<Button
							variant="outline"
							size="xl"
							className="h-12 w-full rounded-full border-primary bg-white"
							onPress={() => setOpen(false)}
						>
							<ButtonText size="sm" className="font-semibold text-primary">
								Perbaiki
							</ButtonText>
						</Button>
					</ButtonGroup>
					<ButtonGroup className="flex-1">
						<Button
							size="xl"
							className="h-12 w-full rounded-full bg-primary"
							onPress={onConfirm}
						>
							<ButtonText size="sm" className="font-semibold text-white">
								Konfirmasi
							</ButtonText>
						</Button>
					</ButtonGroup>
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}
