const record=(action,entry)=>globalThis.__pmFixture.routes.push({action,entry});
export const router={push:entry=>record('push',entry),replace:entry=>record('replace',entry),back:()=>record('back'),canGoBack:()=>globalThis.__pmFixture.history,setParams:params=>{Object.assign(globalThis.__pmFixture.params,params);globalThis.__pmRefresh();}};
export const useLocalSearchParams=()=>globalThis.__pmFixture.params;
export const useFocusEffect=()=>{};
