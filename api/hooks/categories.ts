import type { CategorySchema } from "@/schema/add/category";
import type { CategoryData } from "@/types/api/category";
import { createGetHook, createMutationHook } from "../factory";

export const useCategoriesQuery = createGetHook<CategoryData[]>({
	path: "/contents/categories",
	queryKey: ["categories"],
	name: "categories",
});

export const useCategoryQuery = createGetHook<CategoryData>({
	path: (id) => `/contents/categories/${id}`,
	queryKey: (id) => ["categories", id],
	name: "category",
});

export const useCategoryRequest = createMutationHook<
	CategoryData,
	CategorySchema
>({
	path: "/contents/categories",
	method: "post",
	name: "category",
	invalidateKeys: ["categories"],
});

export const useCategoryAddRequest = useCategoryRequest;

export const useCategoryUpdateRequest = createMutationHook<
	CategoryData,
	CategorySchema
>({
	path: (id) => `/contents/categories/${id}`,
	method: "put",
	name: "category",
	invalidateKeys: (_data, _payload, id) => [["categories"], ["categories", id]],
});

export const useCategoryDeleteRequest = createMutationHook<null, void>({
	path: (id) => `/contents/categories/${id}`,
	method: "delete",
	name: "category",
	invalidateKeys: ["categories"],
});
