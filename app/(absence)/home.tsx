import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Alert, Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import AppModeButton from "@/components/custom/AppModeButton";
import { HeaderBackground } from "@/components/feature/home/Header";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Constants } from "@/constants";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useAbsenceStore } from "@/store/useAbsenceStore";

const FAVORITE_MENUS = [
	{
		id: "riwayat",
		label: "Riwayat",
		icon: (
			<MaterialCommunityIcons
				name="clipboard-text-clock-outline"
				size={26}
				color="#2563eb"
			/>
		),
		locked: false,
	},
	{
		id: "gaji",
		label: "Gaji",
		icon: (
			<MaterialCommunityIcons
				name="card-account-details-outline"
				size={26}
				color="#2563eb"
			/>
		),
		locked: false,
	},
	{
		id: "izin",
		label: "Izin",
		icon: (
			<MaterialCommunityIcons
				name="account-check-outline"
				size={26}
				color="#2563eb"
			/>
		),
		locked: true,
	},
	{
		id: "cuti",
		label: "Cuti",
		icon: (
			<MaterialCommunityIcons
				name="calendar-check-outline"
				size={26}
				color="#2563eb"
			/>
		),
		locked: true,
	},
	{
		id: "lembur",
		label: "Lembur",
		icon: (
			<MaterialCommunityIcons
				name="calendar-clock-outline"
				size={26}
				color="#2563eb"
			/>
		),
		locked: true,
	},
	{
		id: "jadwal",
		label: "Jadwal Kerja",
		icon: (
			<MaterialCommunityIcons
				name="calendar-month-outline"
				size={26}
				color="#2563eb"
			/>
		),
		locked: true,
	},
	{
		id: "pengumuman",
		label: "Pengumuman",
		icon: (
			<MaterialCommunityIcons
				name="bullhorn-outline"
				size={26}
				color="#2563eb"
			/>
		),
		locked: true,
	},
	{
		id: "pengaturan",
		label: "Pengaturan",
		icon: (
			<MaterialCommunityIcons
				name="cog-sync-outline"
				size={26}
				color="#2563eb"
			/>
		),
		locked: true,
	},
];

export default function AbsenceHomeScreen() {
	const { user } = useAuth();
	const { activeTab, setActiveTab, records } = useAbsenceStore();

	const userName = user?.user.name || "Espasito";
	const userRole = user?.roles?.[0]
		? user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1)
		: "Admin";

	const handleActionPress = () => {
		router.push({
			pathname: "/(absence)/record",
			params: { type: activeTab },
		});
	};

	const handleMenuPress = (label: string, isLocked: boolean) => {
		if (isLocked) {
			Alert.alert(
				"Fitur Terkunci",
				`Fitur ${label} belum diaktifkan oleh pengelola toko.`,
			);
		} else {
			Alert.alert("Segera Hadir", `Halaman ${label} sedang disiapkan.`);
		}
	};

	return (
		<Wrapper contentContainerStyle={{ paddingBottom: 32 }}>
			<StatusBar style="light" />

			{/* Blue Header Banner */}
			<View className="relative">
				<HeaderBackground />
				<View style={{ height: Constants.statusBarHeight }} />
				<View className="p-4 pb-14">
					{/* Top App Mode Row */}
					<View className="flex-row items-center justify-between">
						<AppModeButton />
						<View className="flex-row items-center gap-2">
							{/* Notification Bell with Badge */}
							<Pressable
								onPress={() => Alert.alert("Notifikasi", "Tidak ada notifikasi baru.")}
								className="relative size-10 items-center justify-center rounded-full bg-white active:bg-zinc-100"
							>
								<MaterialIcons
									name="notifications-none"
									size={22}
									color={Colors.zinc[700]}
								/>
								<View className="absolute right-1.5 top-1.5 size-4 items-center justify-center rounded-full bg-destructive">
									<Text size="small" w="bold" className="text-[10px] text-white">
										1
									</Text>
								</View>
							</Pressable>

							{/* User Profile Avatar / Icon */}
							<Pressable
								onPress={() => Alert.alert("Profil", `Masuk sebagai ${userName}`)}
								className="size-10 items-center justify-center rounded-full bg-white active:bg-zinc-100"
							>
								<Ionicons name="person" size={20} color={Colors.zinc[700]} />
							</Pressable>
						</View>
					</View>

					{/* Greeting Texts */}
					<View className="mt-4 gap-1">
						<Text className="text-white/80" size="small">
							Selamat datang!
						</Text>
						<Text className="text-white" size="body" w="semibold">
							Siap melayani hari ini 👋
						</Text>
					</View>
				</View>
			</View>

			{/* Main Screen Content */}
			<View className="-mt-8 px-4 gap-4">
				{/* User Profile Card */}
				<Card className="flex-row items-center justify-between p-3.5">
					<View className="flex-row items-center gap-3">
						<Avatar size="md">
							<AvatarFallbackText>{userName}</AvatarFallbackText>
							{user?.user?.avatar && (
								<AvatarImage source={{ uri: user.user.avatar }} />
							)}
						</Avatar>
						<View className="gap-0.5">
							<Text size="normal" w="bold">
								{userName}
							</Text>
							<Text size="small" className="text-muted">
								{userRole}
							</Text>
						</View>
					</View>
					<View className="items-end gap-0.5">
						<Text size="normal" w="bold">
							Selasa
						</Text>
						<Text size="small" className="text-muted">
							28 Oktober 2025
						</Text>
					</View>
				</Card>

				{/* Check-in / Check-out Card */}
				<Card className="gap-4">
					{/* Toggle Tabs */}
					<View className="flex-row items-center gap-3">
						<Pressable
							onPress={() => setActiveTab("in")}
							className={cn(
								"flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 border active:opacity-85",
								activeTab === "in"
									? "border-primary bg-primary-50/50"
									: "border-border-muted bg-white",
							)}
						>
							<Feather
								name="log-in"
								size={18}
								color={activeTab === "in" ? Colors.primary : Colors.zinc[500]}
							/>
							<Text
								size="normal"
								w="semibold"
								className={activeTab === "in" ? "text-primary" : "text-zinc-600"}
							>
								Absen Masuk
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setActiveTab("out")}
							className={cn(
								"flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 border active:opacity-85",
								activeTab === "out"
									? "border-primary bg-primary-50/50"
									: "border-border-muted bg-white",
							)}
						>
							<Feather
								name="log-out"
								size={18}
								color={activeTab === "out" ? Colors.primary : Colors.zinc[500]}
							/>
							<Text
								size="normal"
								w="semibold"
								className={activeTab === "out" ? "text-primary" : "text-zinc-600"}
							>
								Absen Keluar
							</Text>
						</Pressable>
					</View>

					{/* Time Schedule Display Boxes */}
					<View className="flex-row items-center gap-3">
						<View className="flex-1 items-center justify-center rounded-xl bg-primary-50/70 py-4 gap-1">
							<Feather name="clock" size={22} color={Colors.primary} />
							<Text size="body" w="bold" className="text-2xl text-primary mt-1">
								17:00
							</Text>
							<Text size="small" className="text-muted">
								Jam Masuk
							</Text>
						</View>
						<View className="flex-1 items-center justify-center rounded-xl bg-zinc-100/80 py-4 gap-1">
							<Feather name="clock" size={22} color={Colors.zinc[500]} />
							<Text size="body" w="bold" className="text-2xl text-foreground mt-1">
								05:00
							</Text>
							<Text size="small" className="text-muted">
								Jam Keluar
							</Text>
						</View>
					</View>

					{/* Primary Action Button */}
					<Button
						size="xl"
						action="primary"
						className="h-12 w-full rounded-full gap-2"
						onPress={handleActionPress}
					>
						<FontAwesome5 name="hand-pointer" size={16} color="white" />
						<ButtonText className="text-base font-semibold text-white">
							{activeTab === "in" ? "Jam Masuk" : "Jam Keluar"}
						</ButtonText>
					</Button>
				</Card>

				{/* Favorite Menu Section */}
				<View className="gap-2.5">
					<Text size="normal" w="bold">
						Menu Favorit
					</Text>
					<Card className="p-3">
						<View className="flex-row flex-wrap">
							{FAVORITE_MENUS.map((menu) => (
								<Pressable
									key={menu.id}
									onPress={() => handleMenuPress(menu.label, menu.locked)}
									className="w-1/4 items-center justify-center py-2.5 active:opacity-70"
								>
									<View className="relative size-12 items-center justify-center rounded-xl border border-primary-100 bg-primary-50/60 shadow-sm">
										{menu.icon}
										{menu.locked && (
											<View className="absolute -top-1.5 -right-1.5 size-4 items-center justify-center rounded-full bg-amber-400 border border-white">
												<Entypo name="lock" size={10} color="#78350f" />
											</View>
										)}
									</View>
									<Text
										size="small"
										numberOfLines={1}
										className="mt-1.5 text-center text-xs text-foreground"
									>
										{menu.label}
									</Text>
								</Pressable>
							))}
						</View>
					</Card>
				</View>

				{/* Riwayat Absensi Section */}
				<View className="gap-2.5">
					<Text size="normal" w="bold">
						Riwayat Absensi
					</Text>
					<View className="gap-2.5">
						{records.map((item) => (
							<Card key={item.id} className="p-3.5">
								<View className="flex-row items-center gap-3">
									{/* Calendar Icon Badge */}
									<View className="size-11 items-center justify-center rounded-xl bg-primary-50">
										<Feather name="calendar" size={20} color={Colors.primary} />
									</View>

									{/* Record Details */}
									<View className="flex-1 gap-1.5">
										<Text size="normal" w="semibold" className="text-primary">
											{item.date}
										</Text>
										<View className="flex-row items-center justify-between">
											<View className="flex-row items-center gap-1.5">
												<Feather name="clock" size={14} color={Colors.green[500]} />
												<Text size="small" className="text-muted">
													Jam Masuk
												</Text>
											</View>
											<Text size="small" w="medium">
												{item.checkIn}
											</Text>
										</View>
										<View className="flex-row items-center justify-between">
											<View className="flex-row items-center gap-1.5">
												<Feather name="clock" size={14} color={Colors.red[500]} />
												<Text size="small" className="text-muted">
													Jam Keluar
												</Text>
											</View>
											<Text size="small" w="medium">
												{item.checkOut}
											</Text>
										</View>
									</View>
								</View>
							</Card>
						))}
					</View>
				</View>
			</View>
		</Wrapper>
	);
}
