import React from "react";
export const router = {
	push: (value: unknown) => globalThis.__sd5Navigation?.push(value),
	back: () => globalThis.__sd5Navigation?.push("back"),
	canGoBack: () => false,
	replace: (value: unknown) => globalThis.__sd5Navigation?.push(value),
};
export const useRouter = () => router;
export const useLocalSearchParams = () => globalThis.__sd5Params ?? {};
export const useGlobalSearchParams = useLocalSearchParams;
export const usePathname = () => globalThis.__sd5Path ?? "/inventory/stock-adjustment/detail";
export const useFocusEffect = (effect: () => void) => React.useEffect(effect, [effect]);
