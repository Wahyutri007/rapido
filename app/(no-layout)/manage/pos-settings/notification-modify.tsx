import Feather from "@expo/vector-icons/Feather";
import { router, useGlobalSearchParams } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { useStoresQuery } from "@/api/hooks/stores";
import BottomActionButton from "@/components/common/BottomActionButton";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal, { useAlertModal } from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Colors } from "@/constants/Colors";
import { AVAILABLE_REPORTS } from "@/constants/data/manage/notification-schedules";
import { cn } from "@/lib/utils";
import { useNotificationScheduleStore } from "@/store/notificationScheduleStore";

const FREQUENCY_OPTIONS = [
	{ label: "Setiap Hari", value: "Setiap hari" },
	{ label: "Setiap Minggu", value: "Setiap minggu" },
	{ label: "Setiap Bulan", value: "Setiap bulan" },
];

export default function NotificationModifyScreen() {
	const params = useGlobalSearchParams<{ id?: string }>();
	const isEdit = Boolean(params?.id);
	const { getSchedule, addSchedule, updateSchedule } =
		useNotificationScheduleStore();
	const { data: storesData } = useStoresQuery();
	const successModal = useAlertModal();

	const existing = isEdit && params.id ? getSchedule(params.id) : undefined;

	// Form state
	const [title, setTitle] = React.useState(
		existing?.title ?? "Laporan Penjualan Harian",
	);
	const [outlet, setOutlet] = React.useState(existing?.outlet ?? "Toko Utama");
	const [selectedReports, setSelectedReports] = React.useState<string[]>(
		existing?.reports ?? ["Laporan Penjualan", "Laporan Stok", "Laporan Omzet"],
	);
	const [frequency, setFrequency] = React.useState(
		existing?.frequency ?? "Setiap hari",
	);
	const [time, setTime] = React.useState(existing?.time ?? "08:00");
	const [channels, setChannels] = React.useState<("email" | "whatsapp")[]>(
		existing?.channels ?? ["email", "whatsapp"],
	);

	// Recipients state
	const [emails, setEmails] = React.useState<string[]>(
		existing?.recipients
			.filter((r) => r.type === "email")
			.map((r) => r.value) ?? ["admin@gmail.com", "managertoko@gmail.com"],
	);
	const [emailInput, setEmailInput] = React.useState("");

	const [phones, setPhones] = React.useState<string[]>(
		existing?.recipients
			.filter((r) => r.type === "whatsapp")
			.map((r) => r.value.replace(/^\+62\s?/, "")) ?? [
			"08123456482",
			"085287463724",
		],
	);
	const [phoneInput, setPhoneInput] = React.useState("");
	const [notes, setNotes] = React.useState(existing?.notes ?? "");

	// Stores list for SingleSelect
	const storeOptions = React.useMemo(() => {
		if (storesData && storesData.length > 0) {
			return storesData.map((s) => ({
				label: s.name,
				value: s.name,
			}));
		}
		return [
			{ label: "Toko Utama", value: "Toko Utama" },
			{ label: "Cabang Barat", value: "Cabang Barat" },
			{ label: "Semua Outlet", value: "Semua Outlet" },
		];
	}, [storesData]);

	const toggleReport = (reportLabel: string) => {
		setSelectedReports((prev) =>
			prev.includes(reportLabel)
				? prev.filter((r) => r !== reportLabel)
				: [...prev, reportLabel],
		);
	};

	const toggleChannel = (ch: "email" | "whatsapp") => {
		setChannels((prev) =>
			prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
		);
	};

	const handleAddEmail = () => {
		if (emailInput.trim() && !emails.includes(emailInput.trim())) {
			setEmails([...emails, emailInput.trim()]);
			setEmailInput("");
		}
	};

	const handleRemoveEmail = (em: string) => {
		setEmails(emails.filter((e) => e !== em));
	};

	const handleAddPhone = () => {
		if (phoneInput.trim() && !phones.includes(phoneInput.trim())) {
			setPhones([...phones, phoneInput.trim()]);
			setPhoneInput("");
		}
	};

	const handleRemovePhone = (ph: string) => {
		setPhones(phones.filter((p) => p !== ph));
	};

	const handleSave = () => {
		const allRecipients = [
			...emails.map((e) => ({
				type: "email" as const,
				value: e,
			})),
			...phones.map((p) => ({
				type: "whatsapp" as const,
				value: p.startsWith("+") ? p : `+62 ${p}`,
			})),
		];

		const payload = {
			title: title.trim() || "Laporan Jadwal",
			status: (existing?.status ?? "active") as "active" | "inactive",
			frequency,
			time,
			channels,
			recipientCount: allRecipients.length,
			recipients: allRecipients,
			reports: selectedReports,
			outlet,
			nextRun: `Besok ${time}`,
			notes: notes.trim(),
		};

		if (isEdit && params.id) {
			updateSchedule(params.id, payload);
		} else {
			addSchedule(payload);
		}

		successModal.open();
	};

	return (
		<Wrapper className="px-4 pt-4 pb-28 gap-4">
			{/* 1. Informasi Dasar */}
			<Card className="gap-3 p-4">
				<View>
					<Text size="normal" w="bold" className="text-foreground">
						Informasi Dasar
					</Text>
					<Text size="small" className="mt-0.5 text-muted">
						Lengkapi Informasi dasar jadwal anda
					</Text>
				</View>

				<View className="gap-1.5">
					<Text size="normal" w="medium" className="text-foreground">
						Nama Jadwal
					</Text>
					<Input className="h-12 rounded-xl bg-zinc-100 border-0 px-3">
						<InputField
							value={title}
							onChangeText={setTitle}
							placeholder="Masukkan nama jadwal"
							className="text-foreground"
						/>
					</Input>
				</View>

				<View className="gap-1.5">
					<View className="flex-row items-center gap-1.5">
						<Text size="normal" w="medium" className="text-foreground">
							Outlet / Toko *
						</Text>
						<Feather name="info" size={14} color={Colors.zinc[400]} />
					</View>
					<SingleSelect
						items={storeOptions}
						value={outlet}
						onValueChange={setOutlet}
						placeholder="Pilih toko untuk ditambahkan"
						label="Outlet / Toko"
						variant="rounded"
					/>
				</View>
			</Card>

			{/* 2. Pilih Laporan */}
			<Card className="gap-3 p-4">
				<View>
					<Text size="normal" w="bold" className="text-foreground">
						Pilih Laporan
					</Text>
					<Text size="small" className="mt-0.5 text-muted">
						Pilih laporan yang ingin dikirim
					</Text>
				</View>

				<View className="gap-2.5">
					{AVAILABLE_REPORTS.map((rep) => {
						const isChecked = selectedReports.includes(rep.label);
						return (
							<BouncyPressable
								key={rep.id}
								onPress={() => toggleReport(rep.label)}
								activeScale={0.98}
								className={cn(
									"flex-row items-start gap-3 rounded-xl border p-3",
									isChecked
										? "border-primary bg-primary/5"
										: "border-zinc-200 bg-white",
								)}
							>
								<View
									className={cn(
										"mt-0.5 size-5 items-center justify-center rounded-md border",
										isChecked
											? "border-primary bg-primary"
											: "border-zinc-300 bg-white",
									)}
								>
									{isChecked && (
										<Feather name="check" size={13} color="#ffffff" />
									)}
								</View>
								<View className="flex-1">
									<Text
										size="normal"
										w="semibold"
										className={isChecked ? "text-primary" : "text-foreground"}
									>
										{rep.label}
									</Text>
									<Text
										size="small"
										className="mt-0.5 text-muted leading-tight"
									>
										{rep.description}
									</Text>
								</View>
							</BouncyPressable>
						);
					})}
				</View>
			</Card>

			{/* 3. Atur Jadwal */}
			<Card className="gap-3 p-4">
				<View>
					<Text size="normal" w="bold" className="text-foreground">
						Atur Jadwal
					</Text>
					<Text size="small" className="mt-0.5 text-muted">
						Pilih frekuensi dan waktu pengiriman
					</Text>
				</View>

				<View className="flex-row gap-3">
					<View className="flex-1 gap-1.5">
						<Text size="small" w="medium" className="text-muted">
							Frekuensi
						</Text>
						<SingleSelect
							items={FREQUENCY_OPTIONS}
							value={frequency}
							onValueChange={setFrequency}
							placeholder="Pilih frekuensi"
							label="Frekuensi"
							variant="rounded"
						/>
					</View>

					<View className="w-[38%] gap-1.5">
						<Text size="small" w="medium" className="text-muted">
							Jam
						</Text>
						<Input className="h-11 rounded-xl bg-zinc-100 border-0 px-3 flex-row items-center">
							<InputField
								value={time}
								onChangeText={setTime}
								placeholder="08:00"
								className="text-foreground"
							/>
							<Feather name="clock" size={16} color={Colors.zinc[400]} />
						</Input>
					</View>
				</View>
			</Card>

			{/* 4. Kirim Melalui */}
			<Card className="gap-3 p-4">
				<Text size="normal" w="bold" className="text-foreground">
					Kirim Melalui
				</Text>

				<View className="gap-2.5">
					<BouncyPressable
						onPress={() => toggleChannel("email")}
						activeScale={0.98}
						className={cn(
							"flex-row items-start gap-3 rounded-xl border p-3",
							channels.includes("email")
								? "border-primary bg-primary/5"
								: "border-zinc-200 bg-white",
						)}
					>
						<View
							className={cn(
								"mt-0.5 size-5 items-center justify-center rounded-md border",
								channels.includes("email")
									? "border-primary bg-primary"
									: "border-zinc-300 bg-white",
							)}
						>
							{channels.includes("email") && (
								<Feather name="check" size={13} color="#ffffff" />
							)}
						</View>
						<View className="flex-1">
							<Text
								size="normal"
								w="semibold"
								className={
									channels.includes("email")
										? "text-primary"
										: "text-foreground"
								}
							>
								Email
							</Text>
							<Text size="small" className="mt-0.5 text-muted leading-tight">
								Kirim laporan lengkap ke email penerima
							</Text>
						</View>
					</BouncyPressable>

					<BouncyPressable
						onPress={() => toggleChannel("whatsapp")}
						activeScale={0.98}
						className={cn(
							"flex-row items-start gap-3 rounded-xl border p-3",
							channels.includes("whatsapp")
								? "border-primary bg-primary/5"
								: "border-zinc-200 bg-white",
						)}
					>
						<View
							className={cn(
								"mt-0.5 size-5 items-center justify-center rounded-md border",
								channels.includes("whatsapp")
									? "border-primary bg-primary"
									: "border-zinc-300 bg-white",
							)}
						>
							{channels.includes("whatsapp") && (
								<Feather name="check" size={13} color="#ffffff" />
							)}
						</View>
						<View className="flex-1">
							<Text
								size="normal"
								w="semibold"
								className={
									channels.includes("whatsapp")
										? "text-primary"
										: "text-foreground"
								}
							>
								WhatsApp
							</Text>
							<Text size="small" className="mt-0.5 text-muted leading-tight">
								Kirim ringkasan laporan otomatis ke nomor WhatsApp
							</Text>
						</View>
					</BouncyPressable>
				</View>
			</Card>

			{/* 5. Penerima */}
			<Card className="gap-4 p-4">
				<View>
					<Text size="normal" w="bold" className="text-foreground">
						Penerima
					</Text>
					<Text size="small" className="mt-0.5 text-muted">
						Lengkapi kontak penerima laporan
					</Text>
				</View>

				{/* Email Penerima */}
				<View className="gap-2">
					<Text size="normal" w="medium" className="text-foreground">
						Email Penerima
					</Text>
					<View className="flex-row items-center gap-2">
						<Input className="h-11 flex-1 rounded-xl bg-zinc-100 border-0 px-3">
							<InputField
								value={emailInput}
								onChangeText={setEmailInput}
								placeholder="contoh@gmail.com"
								keyboardType="email-address"
								autoCapitalize="none"
								onSubmitEditing={handleAddEmail}
								className="text-foreground"
							/>
						</Input>
						<Pressable
							onPress={handleAddEmail}
							className="size-11 items-center justify-center rounded-xl bg-primary-50"
						>
							<Feather name="plus" size={20} color={Colors.primary} />
						</Pressable>
					</View>

					{/* Email Tags Chips */}
					{emails.length > 0 && (
						<View className="flex-row flex-wrap gap-2 pt-1">
							{emails.map((em) => (
								<View
									key={em}
									className="flex-row items-center rounded-lg bg-blue-50 px-2.5 py-1.5 border border-blue-200"
								>
									<Text size="small" w="medium" className="text-primary mr-1.5">
										{em}
									</Text>
									<Pressable onPress={() => handleRemoveEmail(em)} hitSlop={6}>
										<Feather name="x" size={14} color={Colors.primary} />
									</Pressable>
								</View>
							))}
						</View>
					)}
				</View>

				{/* WhatsApp Penerima */}
				<View className="gap-2">
					<Text size="normal" w="medium" className="text-foreground">
						Whatsapp Penerima
					</Text>
					<View className="flex-row items-center gap-2">
						<View className="h-11 flex-row items-center rounded-xl bg-zinc-100 px-3 flex-1">
							<Text size="normal" w="semibold" className="text-muted mr-1.5">
								+62
							</Text>
							<InputField
								value={phoneInput}
								onChangeText={setPhoneInput}
								placeholder="812345678"
								keyboardType="phone-pad"
								onSubmitEditing={handleAddPhone}
								className="text-foreground flex-1"
							/>
						</View>
						<Pressable
							onPress={handleAddPhone}
							className="size-11 items-center justify-center rounded-xl bg-primary-50"
						>
							<Feather name="plus" size={20} color={Colors.primary} />
						</Pressable>
					</View>

					{/* WhatsApp Tags Chips */}
					{phones.length > 0 && (
						<View className="flex-row flex-wrap gap-2 pt-1">
							{phones.map((ph) => (
								<View
									key={ph}
									className="flex-row items-center rounded-lg bg-emerald-50 px-2.5 py-1.5 border border-emerald-200"
								>
									<Text
										size="small"
										w="medium"
										className="text-emerald-700 mr-1.5"
									>
										{ph.startsWith("+") ? ph : `+62 ${ph}`}
									</Text>
									<Pressable onPress={() => handleRemovePhone(ph)} hitSlop={6}>
										<Feather name="x" size={14} color="#059669" />
									</Pressable>
								</View>
							))}
						</View>
					)}
				</View>
			</Card>

			{/* 6. Catatan (Opsional) */}
			<Card className="gap-2 p-4">
				<Text size="normal" w="bold" className="text-foreground">
					Catatan (Opsional)
				</Text>
				<Textarea className="rounded-xl bg-zinc-100 border-0 p-3 min-h-[90px]">
					<TextareaInput
						value={notes}
						onChangeText={setNotes}
						placeholder="Tambahkan catatan..."
						className="text-foreground"
					/>
				</Textarea>
			</Card>

			{/* Bottom Save Action */}
			<BottomActionButton onPress={handleSave}>Simpan</BottomActionButton>

			{/* Success Modal */}
			<SuccessModal
				openState={successModal.openState}
				onClose={() => {
					successModal.close();
					router.back();
				}}
				title={isEdit ? "Jadwal Berhasil Diperbarui" : "Jadwal Berhasil Dibuat"}
				description="Jadwal pemberitahuan laporan otomatis berhasil disimpan."
				buttonText="Selesai"
			/>
		</Wrapper>
	);
}
