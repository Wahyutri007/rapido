import type { TaxSchema } from "@/schema/add/tax";
import type { TaxData } from "@/types/api/tax";
import { createGetHook, createMutationHook } from "../factory";

export const useTaxesQuery = createGetHook<TaxData[]>({
	path: "/contents/taxes",
	queryKey: ["taxes"],
	name: "taxes",
});

export const useTaxQuery = createGetHook<TaxData>({
	path: (id) => `/contents/taxes/${id}`,
	queryKey: (id) => ["taxes", id],
	name: "tax",
});

export const useTaxRequest = createMutationHook<TaxData, TaxSchema>({
	path: "/contents/taxes",
	method: "post",
	name: "tax",
	invalidateKeys: ["taxes"],
});

export const useTaxUpdateRequest = createMutationHook<TaxData, TaxSchema>({
	path: (id) => `/contents/taxes/${id}`,
	method: "put",
	name: "tax",
	invalidateKeys: (_data, _payload, id) => [["taxes"], ["taxes", id]],
});

export const useTaxDeleteRequest = createMutationHook<null, void>({
	path: (id) => `/contents/taxes/${id}`,
	method: "delete",
	name: "tax",
	invalidateKeys: ["taxes"],
});
