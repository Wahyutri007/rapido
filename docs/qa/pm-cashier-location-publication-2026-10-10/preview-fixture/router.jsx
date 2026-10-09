import React from 'react';
const record=(action,entry)=>globalThis.__pmLocation.routes.push({action,entry});
export const router={push:entry=>record('push',entry),replace:entry=>record('replace',entry),dismissTo:entry=>record('dismissTo',entry),back:()=>record('back'),canGoBack:()=>globalThis.__pmLocation.history,setParams:params=>{Object.assign(globalThis.__pmLocation.params,params);globalThis.__pmRefresh();}};
export const useRouter=()=>router;
export const useLocalSearchParams=()=>globalThis.__pmLocation.params;
export const useFocusEffect=()=>{};
export function Tabs({children,tabBar}){
 const screens=React.Children.toArray(children),screen=screens.find(c=>c.props.name==='location/index');
 if(!screen)throw Error('Actual Location tab missing');
 const routes=screens.map(c=>({key:c.props.name,name:c.props.name})),descriptors=Object.fromEntries(screens.map(c=>[c.props.name,{options:c.props.options}]));
 const props={state:{index:routes.findIndex(r=>r.name==='location/index'),routes},descriptors,navigation:{navigate:entry=>record('navigate',entry)}};
 globalThis.__pmLocation.tabProps=props;
 globalThis.__pmLocation.footer=()=>tabBar(props);
 return screen.props.options.header();
}
Tabs.Screen=()=>null;
