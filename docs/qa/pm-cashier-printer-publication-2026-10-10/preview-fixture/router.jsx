import React from 'react';
const state=()=>globalThis.__pmPrinter;
const record=(action,entry)=>state().routes.push({action,entry});
export const router={push:entry=>record('push',entry),replace:entry=>record('replace',entry),back:()=>record('back'),canGoBack:()=>state().history};
export const useLocalSearchParams=()=>state().params;
export const useGlobalSearchParams=useLocalSearchParams;
export const useAppModeStore=selector=>selector({mode:state().appMode});
