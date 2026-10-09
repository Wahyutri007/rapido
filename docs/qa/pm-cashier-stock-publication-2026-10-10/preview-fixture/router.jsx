const record=(action,entry)=>globalThis.__pmStock.routes.push({action,entry});
export const router={push:entry=>record('push',entry),replace:entry=>record('replace',entry),back:()=>record('back'),canGoBack:()=>globalThis.__pmStock.history};
export const useLocalSearchParams=()=>({});
export const useGlobalSearchParams=useLocalSearchParams;
export const useAppModeStore=selector=>selector({mode:'cashier'});
