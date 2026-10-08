import { createGetHook, createMutationHook } from "../factory";
import { VoucherSchema } from "@/schema/add/voucher";
import { VoucherData } from "@/types/api/voucher";

export const useVouchersQuery = createGetHook<VoucherData[]>({
  path: "/contents/vouchers",
  queryKey: ["vouchers"],
  name: "vouchers",
});

export const useVoucherQuery = createGetHook<VoucherData>({
  path: (id) => `/contents/vouchers/${id}`,
  queryKey: (id) => ["vouchers", id],
  name: "voucher",
});

export const useVoucherRequest = createMutationHook<
  VoucherData,
  any // schema -> api transform needed for dates
>({
  path: "/contents/vouchers",
  method: "post",
  name: "voucher",
  invalidateKeys: ["vouchers"],
});

export const useVoucherUpdateRequest = createMutationHook<VoucherData, any>({
  path: (id) => `/contents/vouchers/${id}`,
  method: "put",
  name: "voucher",
  invalidateKeys: (data, payload, id) => [["vouchers"], ["vouchers", id]],
});

export const useVoucherDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/vouchers/${id}`,
  method: "delete",
  name: "voucher",
  invalidateKeys: ["vouchers"],
});
