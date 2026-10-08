import { router } from "expo-router";
import * as SecureStore from "@/lib/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const APP_MODES = {
  BACK_OFFICE: "back-office",
  CASHIER: "cashier",
  OPERATOR: "operator",
  ABSENCE: "absence",
} as const;

export type AppMode = (typeof APP_MODES)[keyof typeof APP_MODES];

export const APP_MODE_LABELS: Record<AppMode, string> = {
  "back-office": "Back Office",
  cashier: "Kasir",
  operator: "Operator",
  absence: "Absensi",
} as const;

type AppModeStore = {
  mode: AppMode;
  isTransitioning: boolean;
  setMode: (mode: AppMode) => void;
  _setTransitioning: (status: boolean) => void;
  switchModeWithTransition: (targetMode: AppMode) => void;
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

export const useAppModeStore = create<AppModeStore>()(
  persist(
    (set, get) => ({
      mode: APP_MODES.BACK_OFFICE,
      isTransitioning: false,
      setMode: (mode) => set({ mode }),
      _setTransitioning: (status) => set({ isTransitioning: status }),
      switchModeWithTransition: (targetMode) => {
        const { mode, isTransitioning, _setTransitioning, setMode } = get();

        if (mode === targetMode || isTransitioning) return;

        // Trigger the splash overlay
        _setTransitioning(true);

        // Wait for the fade-in animation to complete (~300ms)
        setTimeout(() => {
          setMode(targetMode);

          const targets = {
            [APP_MODES.CASHIER]: "/(cashier)/home",
            [APP_MODES.BACK_OFFICE]: "/(back-office)/home",
            [APP_MODES.OPERATOR]: "/(operator)/home",
            [APP_MODES.ABSENCE]: "/(absence)/home",
          } as const;

          router.replace(targets[targetMode]);

          // Hold the "App Reload" state briefly, then fade out
          setTimeout(() => {
            _setTransitioning(false);
          }, 800);
        }, 300);
      },
    }),
    {
      name: "app-mode-storage",
      storage: createJSONStorage(() => secureStorage),
      // Don't persist the transitioning state, only the mode itself
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
