import "../global.css";
import React from "react";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import Text from "../components/common/Text";
import DeleteConfirmModal from "./qc-delete-modal-candidate";
import RoleDeleteDialog from "./qc-delete-role-dialog";
import WorkerDeleteDialog from "./qc-delete-worker-dialog";
import MemberDeleteDialog from "./qc-delete-member-dialog";
import { ALERTS_ILLUSTRATIONS } from "../assets/images/alerts";
import apiClient from "../api/axios";

window.codexDeleteCalls = [];
window.codexDeleteCallbacks = [];
apiClient.defaults.adapter = async (config) => {
	window.codexDeleteCalls.push({ method: config.method, url: config.url });
	if (config.method !== "delete" || !/\/(contents\/(roles|workers)|customers\/data)\/fixture-/.test(config.url)) throw Error("Unexpected fixture request");
	return { data: { success: true, data: null }, status: 200, statusText: "Fixture", headers: {}, config };
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const record = { id: "fixture-delete", name: "Contoh", display_name: "Contoh", permissions: [] };
function Preview() {
	const [loaded] = useFonts({ InterRegular: require("../assets/fonts/Inter_24pt-Regular.ttf"), InterMedium: require("../assets/fonts/Inter_24pt-Medium.ttf"), InterSemiBold: require("../assets/fonts/Inter_24pt-SemiBold.ttf"), InterBold: require("../assets/fonts/Inter_24pt-Bold.ttf") });
	const [kind, setKind] = React.useState("closed");
	const [open, setOpen] = React.useState(false);
	const [serial, setSerial] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	window.codexShowDelete = (next) => { setOpen(true); setKind(next); setLoading(next === "loading"); setSerial((value) => value + 1); };
	window.codexDeleteLoading = setLoading;
	const close = (action) => { setOpen(false); window.codexDeleteCallbacks.push({ kind, action }); };
	const shared = { openState: [open, setOpen], onDeleted: () => close("deleted") };
	if (!loaded) return null;
	return <SafeAreaProvider><GluestackUIProvider mode="light"><QueryClientProvider client={client}><View style={{ flex: 1 }}>
		<Text testID="preview-ready">Preview konfirmasi hapus Codex-3</Text>
		{kind === "role" ? <RoleDeleteDialog key={serial} role={record} {...shared} />
			: kind === "worker" ? <WorkerDeleteDialog key={serial} worker={record} {...shared} />
			: kind === "member" ? <MemberDeleteDialog key={serial} member={record} {...shared} />
			: <DeleteConfirmModal key={serial}
				{...(kind === "legacy" ? { isOpen: open } : { openState: [open, setOpen] })}
				itemName="Contoh"
				title={kind === "long" ? "Hapus seluruh data contoh pada pengaturan yang dipilih?" : undefined}
				description={kind === "message" ? undefined : kind === "long" ? "Data yang dipilih akan dihapus dari daftar. Periksa kembali pilihan dan akses yang masih diperlukan sebelum melanjutkan. Anda dapat membatalkan tindakan ini untuk meninjau data pada halaman sebelumnya." : kind === "node" ? <Text>Deskripsi dari komponen pengguna.</Text> : "Data contoh akan dihapus dari daftar dan tidak dapat digunakan lagi."}
				message={kind === "message" ? "Pesan fallback tetap ditampilkan." : undefined}
				cancelText={kind === "custom" ? "Kembali" : undefined}
				confirmText={kind === "custom" ? "Ya, hapus" : undefined}
				image={kind === "custom" ? ALERTS_ILLUSTRATIONS.category : undefined}
				isLoading={loading}
				onClose={() => close("cancel")}
				onConfirm={() => close("confirm")}
			/>}
	</View></QueryClientProvider></GluestackUIProvider></SafeAreaProvider>;
}
registerRootComponent(Preview);
