import type { WorkerData } from "@/types/api/worker";
import { createGetHook, createMutationHook } from "../factory";

export const useWorkersQuery = createGetHook<WorkerData[]>({
	path: "/contents/workers",
	queryKey: ["workers"],
	name: "workers",
});
export const useWorkerQuery = createGetHook<WorkerData, string>({
	path: (id) => `/contents/workers/${encodeURIComponent(id)}`,
	queryKey: (id) => ["workers", id],
	name: "worker",
});
export const useWorkerRequest = createMutationHook<WorkerData, FormData>({
	path: "/contents/workers",
	name: "worker",
	config: { headers: { "Content-Type": "multipart/form-data" } },
	invalidateKeys: ["workers"],
});
// Laravel parses uploads through POST with its supported PUT method override.
export const useWorkerUpdateRequest = createMutationHook<
	WorkerData,
	FormData,
	string
>({
	path: (id) => `/contents/workers/${encodeURIComponent(id)}`,
	method: "post",
	name: "worker",
	config: { headers: { "Content-Type": "multipart/form-data" } },
	invalidateKeys: (_data, _payload, id) => [["workers"], ["workers", id]],
});
export const useWorkerDeleteRequest = createMutationHook<null, void, string>({
	path: (id) => `/contents/workers/${encodeURIComponent(id)}`,
	method: "delete",
	name: "worker",
	invalidateKeys: (_data, _payload, id) => [["workers"], ["workers", id]],
});
