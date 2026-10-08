import { createGetHook, createMutationHook } from "../factory";
import { PaymentMethodSchema } from "@/schema/add/payment-method";
import { PaymentMethodData } from "@/types/api/payment-method";

export const usePaymentMethodsQuery = createGetHook<PaymentMethodData[]>({
  path: "/contents/payment-methods",
  queryKey: ["payment-methods"],
  name: "payment_methods",
});

export const usePaymentMethodQuery = createGetHook<PaymentMethodData>({
  path: (id) => `/contents/payment-methods/${id}`,
  queryKey: (id) => ["payment-methods", id],
  name: "payment_method",
});

export const usePaymentMethodRequest = createMutationHook<
  PaymentMethodData,
  PaymentMethodSchema
>({
  path: "/contents/payment-methods",
  method: "post",
  name: "payment_method",
  invalidateKeys: ["payment-methods"],
});

export const usePaymentMethodUpdateRequest = createMutationHook<
  PaymentMethodData,
  PaymentMethodSchema
>({
  path: (id) => `/contents/payment-methods/${id}`,
  method: "put",
  name: "payment_method",
  invalidateKeys: (data, payload, id) => [["payment-methods"], ["payment-methods", id]],
});

export const usePaymentMethodDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/payment-methods/${id}`,
  method: "delete",
  name: "payment_method",
  invalidateKeys: ["payment-methods"],
});
