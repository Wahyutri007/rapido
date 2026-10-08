import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "@/lib/storage";
import Keys from "@/constants/Keys";

type ActiveStoreState = {
  activeStoreId: string | null;
  setActiveStoreId: (id: string | null) => void;
  clearActiveStoreId: () => void;
};

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useActiveStore = create<ActiveStoreState>()(
  persist(
    (set) => ({
      activeStoreId: null,
      setActiveStoreId: (id) => set({ activeStoreId: id }),
      clearActiveStoreId: () => set({ activeStoreId: null }),
    }),
    {
      name: Keys.SELECTED_STORE,
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
