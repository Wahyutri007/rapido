import { Platform, Share } from "react-native";

export async function deliverDataExport(
	csv: string,
	filename: string,
): Promise<"download" | "shared" | "cancelled"> {
	if (Platform.OS === "web") {
		const url = URL.createObjectURL(
			new Blob([csv], { type: "text/csv;charset=utf-8" }),
		);
		const link = document.createElement("a");
		try {
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
		} finally {
			link.remove();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		}
		return "download";
	}
	const result = await Share.share({ title: filename, message: csv });
	return result.action === Share.sharedAction ? "shared" : "cancelled";
}
