const record=(action,entry)=>globalThis.__pmDrawer.routes.push({action,entry});
export const router={push:entry=>record('push',entry),replace:entry=>record('replace',entry),back:()=>record('back'),canGoBack:()=>globalThis.__pmDrawer.history};
export const useLocalSearchParams=()=>({});
