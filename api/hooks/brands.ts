import type { BrandSchema } from "@/schema/add/brand";
import type { BrandData } from "@/types/api/brand";
import { createGetHook, createMutationHook } from "../factory";

export const useBrandsQuery = createGetHook<BrandData[]>({
	path: "/contents/brands",
	queryKey: ["brands"],
	name: "brands",
});

export const useBrandQuery = createGetHook<BrandData>({
	path: (id) => `/contents/brands/${id}`,
	queryKey: (id) => ["brands", id],
	name: "brand",
});

export const useBrandRequest = createMutationHook<BrandData, BrandSchema>({
	path: "/contents/brands",
	method: "post",
	name: "brand",
	invalidateKeys: ["brands"],
});

export const useBrandUpdateRequest = createMutationHook<BrandData, BrandSchema>(
	{
		path: (id) => `/contents/brands/${id}`,
		method: "put",
		name: "brand",
		invalidateKeys: (_data, _payload, id) => [["brands"], ["brands", id]],
	},
);

export const useBrandDeleteRequest = createMutationHook<null, void>({
	path: (id) => `/contents/brands/${id}`,
	method: "delete",
	name: "brand",
	invalidateKeys: ["brands"],
});
