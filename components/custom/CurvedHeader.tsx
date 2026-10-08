import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useLogoutRequest } from "@/api/hooks/auth";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Text from "@/components/common/Text";
import AppModeButton from "@/components/custom/AppModeButton";
import { EFeather } from "@/components/icons";
import { Button, ButtonGroup, ButtonIcon } from "@/components/ui/button";
import { Constants } from "@/constants";
import { cn, tw } from "@/lib/utils";

export function HeaderBlob(props: React.ComponentProps<typeof Svg>) {
	return (
		<View className="absolute bottom-0 right-0">
			<Svg width={224} height={91} viewBox="0 0 224 91" fill="none" {...props}>
				<Path
					d="M270 121.67c0 35.041-40.388 46.83-113.143 46.83S0 160.041 0 125C0 89.96 91.245 19.5 164 19.5s106 67.13 106 102.17z"
					fill="#fff"
					fillOpacity={0.1}
				/>
				<Path
					d="M348 99.362c0 36.768-45.781 49.138-128.25 49.138S6 143.527 6 106.759 126 3 204.5 0C286.969 0 348 62.594 348 99.362z"
					fill="#fff"
					fillOpacity={0.1}
				/>
			</Svg>
		</View>
	);
}

export function HeaderBackground({ heightOffset = 42 }: { heightOffset?: number }) {
	return (
		<View
			pointerEvents="none"
			className="bg-primary w-full rounded-b-2xl overflow-hidden absolute"
			style={{ height: Constants.statusBarHeight + tw(heightOffset) }}
		>
			<HeaderBlob />
		</View>
	);
}

export type CurvedHeaderProps = {
	title?: string;
	subtitle?: string;
	children?: React.ReactNode;
	className?: string;
	heightOffset?: number;
	notificationBadgeCount?: number;
	onNotificationPress?: () => void;
	onUserPress?: () => void;
};

export default function CurvedHeader({
	title = "Selamat datang!",
	subtitle = "Siap melayani hari ini 👋",
	children,
	className,
	heightOffset = 42,
	notificationBadgeCount = 1,
	onNotificationPress,
	onUserPress,
}: CurvedHeaderProps) {
	const logoutModal = useAlertModal();
	const logoutErrorModal = useAlertModal();
	const logoutRequest = useLogoutRequest();

	async function handleLogout() {
		const [, error] = await logoutRequest.call();

		if (error) {
			logoutErrorModal.open();
			return;
		}

		logoutModal.close();
	}

	function handleNotification() {
		if (onNotificationPress) {
			onNotificationPress();
		} else {
			alert("Notifikasi: Tidak ada notifikasi baru.");
		}
	}

	function handleUser() {
		if (onUserPress) {
			onUserPress();
		} else {
			logoutModal.open();
		}
	}

	return (
		<>
			<AlertModal
				title={"Apakah Anda yakin ingin keluar?"}
				message="Anda akan diarahkan ke halaman login."
				openState={logoutModal.openState}
				onClose={logoutModal.close}
				onConfirm={handleLogout}
				confirmText="Ya, Logout"
				cancelText="Batal"
				isLoading={logoutRequest.isLoading}
			/>

			<AlertModal
				title="Gagal Logout"
				message="Terjadi kesalahan saat mencoba logout. Silakan coba lagi."
				openState={logoutErrorModal.openState}
				hideCancelButton
				confirmText="Tutup"
				onClose={logoutErrorModal.close}
			/>

			<View className={cn("relative", className)}>
				<HeaderBackground heightOffset={heightOffset} />

				<View style={{ height: Constants.statusBarHeight }} />
				<View className="p-4 pb-2">
					<View className="w-fit flex-row justify-between">
						<AppModeButton />
						<View className="flex-row">
							<ButtonGroup>
								<View className="relative">
									<Button
										className="bg-white"
										size="iconMd"
										action="secondary"
										onPress={handleNotification}
									>
										<MaterialIcons
											name="notifications-none"
											size={20}
											color="#71717a"
										/>
									</Button>
									{notificationBadgeCount > 0 ? (
										<View className="absolute -top-1 -right-1 size-4 items-center justify-center rounded-full bg-destructive">
											<Text size="small" w="bold" className="text-white">
												{notificationBadgeCount}
											</Text>
										</View>
									) : null}
								</View>
							</ButtonGroup>
							<ButtonGroup className="ml-2">
								<Button
									className="bg-white"
									size="iconMd"
									action="secondary"
									onPress={handleUser}
								>
									<ButtonIcon as={EFeather} name="user" size="iconMd" />
								</Button>
							</ButtonGroup>
						</View>
					</View>

					<View className="mt-4 gap-1">
						{title ? (
							<Text className="text-primary-foreground" size="small">
								{title}
							</Text>
						) : null}
						{subtitle ? (
							<Text className="text-primary-foreground" size="body" w="semibold">
								{subtitle}
							</Text>
						) : null}
					</View>

					{children}
				</View>
			</View>
		</>
	);
}
