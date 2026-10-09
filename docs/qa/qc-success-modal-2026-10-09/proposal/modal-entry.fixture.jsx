import "../global.css";
import React from "react";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import Text from "../components/common/Text";
import SuccessModal from "./qc-success-modal-candidate";
import RoleDeleteDialog from "./qc-success-role-dialog";
import WorkerDeleteDialog from "./qc-success-worker-dialog";
import MemberDeleteDialog from "./qc-success-member-dialog";
import { ALERTS_ILLUSTRATIONS } from "../assets/images/alerts";
import apiClient from "../api/axios";

window.codexModalCalls = [];
window.codexModalCallbacks = [];
apiClient.defaults.adapter = async (config) => {
	window.codexModalCalls.push({ method: config.method, url: config.url });
	if (config.method !== "delete" || !/\/(contents\/(roles|workers)|customers\/data)\/fixture-/.test(config.url)) throw Error("Unexpected fixture request");
	return { data: { success: true, data: null }, status: 200, statusText: "Fixture", headers: {}, config };
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const record = { id: "fixture-modal", name: "Contoh", display_name: "Contoh", permissions: [] };
function Preview() {
	const [loaded] = useFonts({ InterRegular: require("../assets/fonts/Inter_24pt-Regular.ttf"), InterMedium: require("../assets/fonts/Inter_24pt-Medium.ttf"), InterSemiBold: require("../assets/fonts/Inter_24pt-SemiBold.ttf"), InterBold: require("../assets/fonts/Inter_24pt-Bold.ttf") });
	const [kind, setKind] = React.useState("closed");
	const [open, setOpen] = React.useState(false);
	const [serial, setSerial] = React.useState(0);
	window.codexShowModal = (next) => { setOpen(true); setKind(next); setSerial((value) => value + 1); };
	const closed = () => { setOpen(false); window.codexModalCallbacks.push(kind); };
	const shared = { openState: [open, setOpen], onDeleted: closed };
	if (!loaded) return null;
	return <SafeAreaProvider><GluestackUIProvider mode="light"><QueryClientProvider client={client}><View style={{ flex: 1 }}>
		<Text testID="preview-ready">Preview modal Codex-3</Text>
		{kind === "role" ? <RoleDeleteDialog key={serial} role={record} {...shared} />
			: kind === "worker" ? <WorkerDeleteDialog key={serial} worker={record} {...shared} />
			: kind === "member" ? <MemberDeleteDialog key={serial} member={record} {...shared} />
			: <SuccessModal key={serial}
				{...(kind === "legacy" ? { isOpen: open } : { openState: [open, setOpen] })}
				title={kind === "long" ? "Data berhasil diperbarui untuk seluruh pengaturan yang dipilih pada halaman ini" : "Perubahan berhasil disimpan"}
				description={kind === "message" ? undefined : kind === "long" ? "Perubahan pengaturan yang Anda pilih sudah disimpan. Silakan periksa kembali daftar dan detail pada halaman sebelumnya. Jika ingin menyesuaikan data lainnya, tutup pemberitahuan ini lalu lanjutkan dari daftar." : kind === "node" ? <Text>Deskripsi dari komponen pengguna.</Text> : "Data contoh untuk pemeriksaan tampilan."}
				message={kind === "message" ? "Pesan fallback tetap ditampilkan." : undefined}
				buttonText={kind === "custom" ? "Lanjutkan" : undefined}
				confirmText={kind === "message" ? "Mengerti" : undefined}
				hideCloseButton={kind === "no-close"}
				image={kind === "custom" ? ALERTS_ILLUSTRATIONS.category : undefined}
				onClose={closed}
				onButtonPress={kind === "custom" ? closed : undefined}
			/>}
	</View></QueryClientProvider></GluestackUIProvider></SafeAreaProvider>;
}
registerRootComponent(Preview);
