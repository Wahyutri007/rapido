import { createGetHook, createMutationHook } from "../factory";
import { ExtraCostSchema } from "@/schema/add/extra-cost";
import { ExtraCostData } from "@/types/api/extra-cost";

export const useExtraCostsQuery = createGetHook<ExtraCostData[]>({
  path: "/contents/extra-costs",
  queryKey: ["extra-costs"],
  name: "extra_costs",
});

export const useExtraCostQuery = createGetHook<ExtraCostData>({
  path: (id) => `/contents/extra-costs/${id}`,
  queryKey: (id) => ["extra-costs", id],
  name: "extra_cost",
});

export const useExtraCostRequest = createMutationHook<
  ExtraCostData,
  ExtraCostSchema
>({
  path: "/contents/extra-costs",
  method: "post",
  name: "extra_cost",
  invalidateKeys: ["extra-costs"],
});

export const useExtraCostUpdateRequest = createMutationHook<
  ExtraCostData,
  ExtraCostSchema
>({
  path: (id) => `/contents/extra-costs/${id}`,
  method: "put",
  name: "extra_cost",
  invalidateKeys: (data, payload, id) => [["extra-costs"], ["extra-costs", id]],
});

export const useExtraCostDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/extra-costs/${id}`,
  method: "delete",
  name: "extra_cost",
  invalidateKeys: ["extra-costs"],
});
