import { createGetHook, createMutationHook } from "../factory";
import { PromoSchema } from "@/schema/add/promo";
import { PromoData } from "@/types/api/promo";

export const usePromosQuery = createGetHook<PromoData[]>({
  path: "/contents/promos",
  queryKey: ["promos"],
  name: "promos",
});

export const usePromoQuery = createGetHook<PromoData>({
  path: (id) => `/contents/promos/${id}`,
  queryKey: (id) => ["promos", id],
  name: "promo",
});

export const usePromoRequest = createMutationHook<PromoData, any>({
  path: "/contents/promos",
  method: "post",
  name: "promo",
  invalidateKeys: ["promos"],
});

export const usePromoUpdateRequest = createMutationHook<PromoData, any>({
  path: (id) => `/contents/promos/${id}`,
  method: "put",
  name: "promo",
  invalidateKeys: (data, payload, id) => [["promos"], ["promos", id]],
});

export const usePromoDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/promos/${id}`,
  method: "delete",
  name: "promo",
  invalidateKeys: ["promos"],
});
