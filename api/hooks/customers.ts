import type { CustomerData, CustomerPayload } from "@/types/api/customer";
import { createGetHook, createMutationHook } from "../factory";

export const useCustomersQuery = createGetHook<CustomerData[]>({
	path: "/customers/data",
	queryKey: ["customers"],
	name: "customers",
});
export const useCustomerQuery = createGetHook<CustomerData, string>({
	path: (id) => `/customers/data/${encodeURIComponent(id)}`,
	queryKey: (id) => ["customers", id],
	name: "customer",
});
export const useCustomerRequest = createMutationHook<
	CustomerData,
	CustomerPayload
>({
	path: "/customers/data",
	name: "customer",
	invalidateKeys: ["customers"],
});
export const useCustomerUpdateRequest = createMutationHook<
	CustomerData,
	CustomerPayload,
	string
>({
	path: (id) => `/customers/data/${encodeURIComponent(id)}`,
	method: "put",
	name: "customer",
	invalidateKeys: (_data, _payload, id) => [["customers"], ["customers", id]],
});
export const useCustomerDeleteRequest = createMutationHook<null, void, string>({
	path: (id) => `/customers/data/${encodeURIComponent(id)}`,
	method: "delete",
	name: "customer",
	invalidateKeys: (_data, _payload, id) => [["customers"], ["customers", id]],
});
