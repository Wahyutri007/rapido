import { createGetHook, createMutationHook } from "../factory";
import type { BundlingData } from "@/types/api/bundling";

export const useBundlingsQuery = createGetHook<BundlingData[]>({
	path: "/contents/bundlings",
	queryKey: ["bundlings"],
	name: "bundlings",
});

export const useBundlingQuery = createGetHook<BundlingData>({
	path: (id) => `/contents/bundlings/${id}`,
	queryKey: (id) => ["bundlings", id],
	name: "bundling",
});

export const useBundlingRequest = createMutationHook<BundlingData, any>({
	path: "/contents/bundlings",
	method: "post",
	name: "bundling",
	invalidateKeys: ["bundlings"],
});

export const useBundlingUpdateRequest = createMutationHook<BundlingData, any>({
	path: (id) => `/contents/bundlings/${id}`,
	method: "put",
	name: "bundling",
	invalidateKeys: (data, payload, id) => [["bundlings"], ["bundlings", id]],
});

export const useBundlingDeleteRequest = createMutationHook<null, void>({
	path: (id) => `/contents/bundlings/${id}`,
	method: "delete",
	name: "bundling",
	invalidateKeys: ["bundlings"],
});
