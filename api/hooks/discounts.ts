import { createGetHook, createMutationHook } from "../factory";
import { DiscountSchema } from "@/schema/add/discount";
import { DiscountData } from "@/types/api/discount";

export const useDiscountsQuery = createGetHook<DiscountData[]>({
  path: "/contents/discounts",
  queryKey: ["discounts"],
  name: "discounts",
});

export const useDiscountQuery = createGetHook<DiscountData>({
  path: (id) => `/contents/discounts/${id}`,
  queryKey: (id) => ["discounts", id],
  name: "discount",
});

export const useDiscountRequest = createMutationHook<
  DiscountData,
  DiscountSchema
>({
  path: "/contents/discounts",
  method: "post",
  name: "discount",
  invalidateKeys: ["discounts"],
});

export const useDiscountUpdateRequest = createMutationHook<
  DiscountData,
  DiscountSchema
>({
  path: (id) => `/contents/discounts/${id}`,
  method: "put",
  name: "discount",
  invalidateKeys: (data, payload, id) => [["discounts"], ["discounts", id]],
});

export const useDiscountDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/discounts/${id}`,
  method: "delete",
  name: "discount",
  invalidateKeys: ["discounts"],
});
