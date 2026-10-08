import { useAuth } from "@/context/AuthContext";
import { useActiveStore } from "@/store/useActiveStore";
import { StoreShiftData } from "@/types/api/store-shift";
import { createGetHook, createMutationHook } from "../factory";

const useOpenStoreShiftInternal = createMutationHook<StoreShiftData>({
  path: "/stores/shift/open",
  method: "post",
  name: "store-shift",
});

export const useOpenStoreShift = () => {
  const { user } = useAuth();
  const { activeStoreId } = useActiveStore();

  const isOwner = user?.roles.includes("owner");

  return useOpenStoreShiftInternal(
    undefined,
    isOwner ? { store_id: activeStoreId } : undefined,
  );
};

const useLatestStoreShiftInternal = createGetHook<StoreShiftData>({
  path: "/stores/shift",
  queryKey: ["store-shifts", "latest"],
  name: "latest-shift",
});

/**
 * Universal hook to fetch the latest shift for the current context.
 * For owners, it automatically appends the activeStoreId as a query parameter.
 */
export const useLatestStoreShiftQuery = () => {
  const { user } = useAuth();
  const { activeStoreId } = useActiveStore();

  const isOwner = user?.roles.includes("owner");

  return useLatestStoreShiftInternal(
    isOwner ? { store_id: activeStoreId } : undefined,
  );
};
