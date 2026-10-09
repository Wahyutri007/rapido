import "../global.css";
import React from "react";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import Text from "../components/common/Text";
import AlertModal from "../components/common/AlertModal";
import RoleDeleteDialog from "../components/feature/manage/roles/RoleDeleteDialog";
import WorkerDeleteDialog from "../components/feature/manage/workers/WorkerDeleteDialog";
import MemberDeleteDialog from "../components/feature/manage/member/MemberDeleteDialog";
import { ALERTS_ILLUSTRATIONS } from "../assets/images/alerts";
import apiClient from "../api/axios";

window.codexAlertCalls = [];
window.codexAlertCallbacks = [];
window.codexAlertFailNext = false;
apiClient.defaults.adapter = async (config) => {
	window.codexAlertCalls.push({ method: config.method, url: config.url, rejected: window.codexAlertFailNext });
	if (config.method !== "delete" || !/\/(contents\/(roles|workers)|customers\/data)\/fixture-/.test(config.url)) throw Error("Unexpected fixture request");
	if (window.codexAlertFailNext) { window.codexAlertFailNext = false; throw Error("Fixture delete failed"); }
	return { data: { success: true, data: null }, status: 200, statusText: "Fixture", headers: {}, config };
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const record = { id: "fixture-alert", name: "Contoh", display_name: "Contoh", permissions: [] };
function Preview() {
	const [loaded] = useFonts({ InterRegular: require("../assets/fonts/Inter_24pt-Regular.ttf"), InterMedium: require("../assets/fonts/Inter_24pt-Medium.ttf"), InterSemiBold: require("../assets/fonts/Inter_24pt-SemiBold.ttf"), InterBold: require("../assets/fonts/Inter_24pt-Bold.ttf") });
	const [kind, setKind] = React.useState("closed");
	const [open, setOpen] = React.useState(false);
	const [serial, setSerial] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	window.codexShowAlert = (next) => { setOpen(true); setKind(next); setLoading(next === "loading"); setSerial((value) => value + 1); window.codexAlertFailNext = ["role", "worker", "member"].includes(next); };
	window.codexAlertLoading = setLoading;
	window.codexHideAlert = () => setOpen(false);
	const close = (action) => { setOpen(false); window.codexAlertCallbacks.push({ kind, action }); };
	const shared = { openState: [open, setOpen], onDeleted: () => close("deleted") };
	if (!loaded) return null;
	return <SafeAreaProvider><GluestackUIProvider mode="light"><QueryClientProvider client={client}><View style={{ flex: 1 }}>
		<Text testID="preview-ready">Preview peringatan Codex-3</Text>
		{kind === "role" ? <RoleDeleteDialog key={serial} role={record} {...shared} />
			: kind === "worker" ? <WorkerDeleteDialog key={serial} worker={record} {...shared} />
			: kind === "member" ? <MemberDeleteDialog key={serial} member={record} {...shared} />
			: <AlertModal key={serial} openState={[open, setOpen]}
				title={kind === "support" ? "Pengiriman belum tersedia" : kind === "long" ? "Periksa kembali seluruh data pada pengaturan yang dipilih" : "Periksa kembali data"}
				message={kind === "support" ? "Feedback Anda belum dikirim. Isi form tetap tersedia selama halaman ini terbuka. Silakan coba kembali setelah layanan pengiriman tersedia." : kind === "node" ? <Text>Pesan dari komponen pengguna.</Text> : kind === "long" ? "Perubahan belum dapat disimpan. Silakan periksa koneksi dan pilihan data sebelum mencoba kembali. Input yang sudah Anda masukkan tetap tersedia selama halaman ini terbuka. Tutup pesan ini untuk kembali memeriksa form." : "Perubahan belum disimpan. Periksa data lalu coba kembali."}
				image={kind === "category" ? ALERTS_ILLUSTRATIONS.category : kind === "order-type" ? ALERTS_ILLUSTRATIONS.orderType : undefined}
				hideCancelButton={["support", "confirm-only", "category", "order-type", "no-footer"].includes(kind)}
				hideConfirmButton={["cancel-only", "no-footer"].includes(kind)}
				confirmText={kind === "support" ? "Kembali ke form" : ["category", "order-type"].includes(kind) ? "Mengerti" : undefined}
				isLoading={loading}
				{...(kind === "default-close" ? {} : { onClose: () => close("cancel") })}
				{...(kind === "fallback" || kind === "default-close" ? {} : { onConfirm: () => close("confirm") })}
			>{kind === "children" && <Text>Isi tambahan dari pemanggil.</Text>}</AlertModal>}
	</View></QueryClientProvider></GluestackUIProvider></SafeAreaProvider>;
}
registerRootComponent(Preview);
