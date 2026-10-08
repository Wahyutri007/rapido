import { createGetHook, createMutationHook } from "../factory";
import { OrderTypeSchema } from "@/schema/add/order-type";
import { OrderTypeData } from "@/types/api/order-type";

export const useOrderTypesQuery = createGetHook<OrderTypeData[]>({
  path: "/contents/order-types",
  queryKey: ["order-types"],
  name: "order_types",
});

export const useOrderTypeQuery = createGetHook<OrderTypeData>({
  path: (id) => `/contents/order-types/${id}`,
  queryKey: (id) => ["order-types", id],
  name: "order_type",
});

export const useOrderTypeRequest = createMutationHook<
  OrderTypeData,
  OrderTypeSchema
>({
  path: "/contents/order-types",
  method: "post",
  name: "order_type",
  invalidateKeys: ["order-types"],
});

export const useOrderTypeUpdateRequest = createMutationHook<
  OrderTypeData,
  OrderTypeSchema
>({
  path: (id) => `/contents/order-types/${id}`,
  method: "put",
  name: "order_type",
  invalidateKeys: (data, payload, id) => [["order-types"], ["order-types", id]],
});

export const useOrderTypeDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/order-types/${id}`,
  method: "delete",
  name: "order_type",
  invalidateKeys: ["order-types"],
});
