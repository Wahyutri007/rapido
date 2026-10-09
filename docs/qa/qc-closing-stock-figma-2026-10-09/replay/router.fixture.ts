import React from "react";
export const router={push:(value:unknown)=>globalThis.__sd5Navigation?.push(value),back:()=>globalThis.__sd5Navigation?.push('back'),canGoBack:()=>false,replace:(value:unknown)=>globalThis.__sd5Navigation?.push(value)};
export const useRouter=()=>router;
export const usePathname=()=>'/inventory/closing-stock';
export const useFocusEffect=(effect:()=>void)=>React.useEffect(effect,[effect]);
export const useLocalSearchParams=()=>({});
export const useGlobalSearchParams=()=>({});
