import { z } from "zod";

export const absenceRecordSchema = z.object({
	store_id: z.string().min(1, "Silakan pilih toko"),
	location_name: z.string().min(1, "Lokasi tidak boleh kosong"),
	latitude: z.string().min(1, "Latitude tidak boleh kosong"),
	longitude: z.string().min(1, "Longitude tidak boleh kosong"),
	description: z.string().optional(),
	photo_uri: z.string().optional(),
});

export type AbsenceRecordFormData = z.infer<typeof absenceRecordSchema>;
