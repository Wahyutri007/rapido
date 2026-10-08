import { useAuth } from "@/context/AuthContext";
import { useActiveStore } from "@/store/useActiveStore";
import type { StoreData } from "@/types/api/store";
import { createGetHook, createMutationHook } from "../factory";

export const useStoresQuery = createGetHook<StoreData[]>({
	path: "/stores",
	queryKey: ["stores"],
	name: "stores",
});

export const useStoreQuery = createGetHook<StoreData>({
	path: (id) => `/stores/${id}`,
	queryKey: (id) => ["stores", id],
	name: "store",
});

/**
 * Hook to get the currently active store (for owners) or assigned store (for workers).
 */
export const useCurrentStoreQuery = () => {
	const { user } = useAuth();
	const { activeStoreId } = useActiveStore();

	const isOwner = user?.roles.includes("owner");
	const storeId = isOwner ? activeStoreId : user?.user.team_id;

	return useStoreQuery(storeId);
};

export const useStoreRequest = createMutationHook<StoreData, any>({
	path: "/stores",
	method: "post",
	name: "store",
	invalidateKeys: ["stores"],
});

export const useStoreUpdateRequest = createMutationHook<StoreData, any>({
	path: (id) => `/stores/${id}`,
	method: "put",
	name: "store",
	invalidateKeys: (_data, _payload, id) => [["stores"], ["stores", id]],
});

export const useStoreDeleteRequest = createMutationHook<null, void>({
	path: (id) => `/stores/${id}`,
	method: "delete",
	name: "store",
	invalidateKeys: ["stores"],
});
