import { Platform } from "react-native";
import type { WorkerSchema } from "@/schema/add/worker";
import type { WorkerData } from "@/types/api/worker";

export const WORKER_DEFAULTS: WorkerSchema = {
	name: "",
	email: "",
	phone: "",
	role_id: "",
	store_id: "",
	address: "",
	date_of_birth: "",
	password: "",
	password_confirmation: "",
	face_scan: null,
	id_scan: null,
};

export function workerRoleName(worker: WorkerData) {
	return (
		worker.roles.map((role) => role.display_name || role.name).join(" · ") ||
		"Role belum ditetapkan"
	);
}

export function workerFormValues(worker: WorkerData): WorkerSchema {
	return {
		...WORKER_DEFAULTS,
		name: worker.name,
		email: worker.email,
		phone: worker.phone,
		role_id: worker.role_id ?? "",
		store_id: worker.team_id,
		address: worker.worker_profile?.address ?? "",
		date_of_birth: worker.worker_profile?.date_of_birth?.slice(0, 10) ?? "",
		face_scan: worker.worker_profile?.face_scan ?? null,
		id_scan: worker.worker_profile?.id_scan ?? null,
	};
}

export function workerDate(value: string | null | undefined) {
	if (!value) return "—";
	const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
	return Number.isNaN(date.getTime())
		? "—"
		: date.toLocaleDateString("id-ID", {
				day: "numeric",
				month: "short",
				year: "numeric",
			});
}

export async function workerFormData(value: WorkerSchema, editing: boolean) {
	const body = new FormData();
	for (const key of [
		"name",
		"email",
		"phone",
		"role_id",
		"store_id",
		"address",
		"date_of_birth",
	] as const)
		body.append(key, value[key]);
	if (editing) body.append("_method", "PUT");
	else {
		body.append("password", value.password);
		body.append("password_confirmation", value.password_confirmation);
	}
	for (const key of ["face_scan", "id_scan"] as const) {
		const asset = value[key];
		if (!asset || typeof asset === "string") continue;
		if (Platform.OS === "web") {
			let file: Blob = asset.file as File;
			if (!file) {
				const response = await fetch(asset.uri);
				if (!response.ok)
					throw new Error("Gambar tidak dapat dibaca. Pilih gambar kembali.");
				file = await response.blob();
			}
			body.append(key, file, asset.name);
		} else {
			// Native FormData accepts an upload descriptor rather than a browser Blob.
			body.append(key, {
				uri: asset.uri,
				name: asset.name,
				type: asset.mimeType,
			} as unknown as Blob);
		}
	}
	return body;
}
