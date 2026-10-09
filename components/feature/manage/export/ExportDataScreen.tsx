import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Platform, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
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
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { DEFAULT_TRANSACTION_GROUPS } from "@/components/feature/reports/transaction/mockData";
import { INVENTORY_ITEMS } from "@/constants/data/inventory";
import {
	ALL_EXPORT_STORES,
	buildDataExport,
	EXPORT_TYPES,
	exportStoreOptions,
} from "@/lib/manage/export-data";
import { deliverDataExport } from "@/lib/manage/export-delivery";
import { type ExportSchema, exportSchema } from "@/schema/manage/export";
import { useAccountingStore } from "@/store/accountingStore";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";

export default function ExportDataScreen() {
	const params = useLocalSearchParams<{ store?: string | string[] }>();
	const store = Array.isArray(params.store) ? params.store[0] : params.store;
	return (
		<ExportForm
			key={store ?? ALL_EXPORT_STORES}
			initialStore={store ?? ALL_EXPORT_STORES}
		/>
	);
}

function ExportForm({ initialStore }: { initialStore: string }) {
	const incomes = useAccountingStore((s) => s.incomes);
	const expenses = useAccountingStore((s) => s.expenses);
	const materials = useInventoryMaterialStore((s) => s.materials);
	const form = useForm<ExportSchema>({
		resolver: zodResolver(exportSchema),
		defaultValues: {
			type: "financial",
			store: initialStore,
			start: "",
			end: "",
		},
	});
	const values = useWatch({ control: form.control });
	const type = values.type ?? "financial";
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState("");
	const [error, setError] = useState("");
	const active = useRef(false),
		locked = useRef(false);
	useEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);
	const sources = {
		transactions: DEFAULT_TRANSACTION_GROUPS,
		items: [
			...INVENTORY_ITEMS.filter((item) => item.kind === "product"),
			...materials,
		],
		incomes,
		expenses,
	};
	const normalized = {
		type,
		store:
			type === "financial" ? (values.store ?? initialStore) : ALL_EXPORT_STORES,
		start: values.start ?? "",
		end: values.end ?? "",
	};
	const parsed = exportSchema.safeParse(normalized);
	let preview: ReturnType<typeof buildDataExport> | undefined;
	let previewError = "";
	if (parsed.success) {
		try {
			preview = buildDataExport(parsed.data, sources);
		} catch (e) {
			previewError =
				e instanceof Error ? e.message : "Data tidak dapat disiapkan.";
		}
	}

	async function submit(data: ExportSchema) {
		if (!active.current || locked.current) return;
		locked.current = true;
		setBusy(true);
		setNotice("");
		setError("");
		try {
			const latest = useAccountingStore.getState();
			const output = buildDataExport(
				{
					...data,
					store: data.type === "financial" ? data.store : ALL_EXPORT_STORES,
				},
				{
					transactions: DEFAULT_TRANSACTION_GROUPS,
					items: [
						...INVENTORY_ITEMS.filter((item) => item.kind === "product"),
						...useInventoryMaterialStore.getState().materials,
					],
					incomes: latest.incomes,
					expenses: latest.expenses,
				},
			);
			if (!output.count)
				throw new Error("Tidak ada data yang cocok untuk diekspor.");
			const result = await deliverDataExport(output.csv, output.filename);
			if (active.current)
				setNotice(
					result === "download"
						? "Permintaan unduh CSV dikirim ke browser."
						: result === "shared"
							? "CSV diteruskan ke menu berbagi."
							: "Berbagi dibatalkan.",
				);
		} catch (e) {
			if (active.current)
				setError(
					e instanceof Error ? e.message : "Ekspor gagal. Silakan coba lagi.",
				);
		} finally {
			locked.current = false;
			if (active.current) setBusy(false);
		}
	}

	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-3">
					<Text w="semibold">Ekspor CSV</Text>
					<Text size="normal" className="text-muted">
						Data pratinjau yang tersedia di aplikasi, termasuk data contoh.
						Bukan arsip transaksi server. CSV mencantumkan sumber setiap baris.
					</Text>
				</Card>
				<Card>
					<Form {...form}>
						<View className="gap-4">
							<FormField
								control={form.control}
								name="type"
								render={() => (
									<FormItem>
										<FormLabel>Data</FormLabel>
										<FormControl>
											<FormSelect data={EXPORT_TYPES} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{type === "financial" ? (
								<FormField
									control={form.control}
									name="store"
									render={() => (
										<FormItem>
											<FormLabel>Toko</FormLabel>
											<FormControl>
												<FormSelect
													data={exportStoreOptions(sources)}
													placeholder="Pilih toko"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							) : (
								<Text size="normal" className="text-muted">
									{type === "inventory"
										? "Stok saat ini bersifat agregat, tanpa pemisahan toko atau periode."
										: "Transaksi contoh tidak memiliki identitas toko. Semua transaksi dalam periode akan disertakan."}
								</Text>
							)}
							{type !== "inventory" && (
								<>
									<FormField
										control={form.control}
										name="start"
										render={() => (
											<FormItem>
												<FormLabel>Tanggal mulai (opsional)</FormLabel>
												<FormControl>
													<FormInput placeholder="YYYY-MM-DD" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="end"
										render={() => (
											<FormItem>
												<FormLabel>Tanggal akhir (opsional)</FormLabel>
												<FormControl>
													<FormInput placeholder="YYYY-MM-DD" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Text size="normal" className="text-muted">
										Kosongkan untuk semua tanggal. Batas tanggal termasuk dalam
										hasil.
									</Text>
								</>
							)}
						</View>
					</Form>
				</Card>
				<Card className="gap-3">
					<Text w="semibold">
						{preview
							? `${preview.count} baris siap diekspor`
							: "Periksa pilihan ekspor"}
					</Text>
					{preview?.count === 0 && (
						<Text size="normal" className="text-muted">
							Tidak ada data sesuai pilihan.
						</Text>
					)}
					{Boolean(preview?.excludedInvalidDates) && (
						<Text size="normal" className="text-warning">
							{preview?.excludedInvalidDates} baris tidak disertakan karena
							tanggal sumber tidak valid.
						</Text>
					)}
					{Boolean(previewError) && (
						<Text size="normal" className="text-destructive">
							{previewError}
						</Text>
					)}
					<Text size="normal" className="text-muted">
						{Platform.OS === "web"
							? "Browser akan menerima file CSV UTF-8."
							: "CSV dibagikan sebagai teks melalui aplikasi yang Anda pilih."}
					</Text>
				</Card>
				{Boolean(error) && (
					<Text
						accessibilityRole="alert"
						className="text-destructive"
						size="normal"
					>
						{error}
					</Text>
				)}
				{Boolean(notice) && (
					<Text accessibilityRole="alert" size="normal">
						{notice}
					</Text>
				)}
			</Wrapper>
			<BottomActionButton
				isLoading={busy}
				isDisabled={busy || preview?.count === 0 || Boolean(previewError)}
				onPress={() => form.handleSubmit(submit)()}
			>
				{Platform.OS === "web" ? "Unduh CSV" : "Bagikan CSV"}
			</BottomActionButton>
		</>
	);
}
