import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { View } from "react-native";
import Card from "@/components/common/Card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import { simulateComposition } from "@/lib/inventory/composition";
import { compositionSimulationSchema } from "@/schema/inventory/composition";
import type { CompositionLineFields } from "@/types/ui/inventory/composition";
import InventoryQuantityInput from "../InventoryQuantityInput";
import { InventorySectionHeading } from "../InventoryUi";
import { formatMaterialQuantity } from "../material/MaterialUi";
import { formatCompositionMoney } from "./CompositionUi";

export default function CompositionSimulation({
	lines,
	names,
}: {
	lines: CompositionLineFields[];
	names: Record<string, string>;
}) {
	const form = useForm<{ portions: number }>({
		resolver: zodResolver(compositionSimulationSchema),
		mode: "onChange",
		defaultValues: { portions: 10 },
	});
	const portions = useWatch({ control: form.control, name: "portions" });
	const custom = simulateComposition(lines, portions);
	return (
		<Card density="compact" className="gap-4">
			<InventorySectionHeading
				title="Simulasi Pemakaian Stok"
				description="Lihat estimasi bahan yang terpakai berdasarkan jumlah porsi"
				icon="activity"
			/>
			{[1, 5].map((count) => (
				<View key={count} className="gap-2 border-b border-border-muted pb-3">
					<Text size="normal" w="medium">
						{count} Porsi
					</Text>
					<View className="flex-row justify-between gap-3">
						<Text size="small" className="text-muted">
							Total Biaya Bahan
						</Text>
						<Text size="normal" w="medium">
							{formatCompositionMoney(simulateComposition(lines, count)?.cost)}
						</Text>
					</View>
				</View>
			))}
			<Form {...form}>
				<FormField
					control={form.control}
					name="portions"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Jumlah Kustom</FormLabel>
							<FormControl>
								<InventoryQuantityInput
									value={field.value}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</Form>
			<View className="flex-row justify-between gap-3">
				<Text size="small" className="text-muted">
					Total Biaya Bahan
				</Text>
				<Text size="normal" w="semibold">
					{formatCompositionMoney(custom?.cost)}
				</Text>
			</View>
			{custom ? (
				custom.quantities.map((line) => (
					<View
						key={line.materialId}
						className="flex-row justify-between gap-3"
					>
						<Text size="small" className="flex-1 text-muted">
							{names[line.materialId] ?? "Bahan tidak tersedia"}
						</Text>
						<Text size="small">
							{formatMaterialQuantity(line.quantity)} {line.unit}
						</Text>
					</View>
				))
			) : (
				<Text size="small" className="text-destructive">
					Jumlah porsi tidak valid atau estimasi terlalu besar
				</Text>
			)}
		</Card>
	);
}
