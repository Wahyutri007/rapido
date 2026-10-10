import React from 'react';
const Context=React.createContext(null);
const initial={page:'index',routeName:'index',before:false,mode:'cashier',memberPhase:'ready',memberRows:'all',phase:'open',owner:true,authenticated:true,authLoading:false,userId:'review-user',storeId:'store-a',queryStoreId:'store-a',shiftId:'shift-a',insets:{top:0,left:0,right:0,bottom:0},memberVariant:'normal',params:{},globalParams:{id:'WRONG-GLOBAL'},focused:true};
export const events=[];globalThis.reviewEvents=events;
export function FixtureProvider({children}){const [state,setState]=React.useState(initial);globalThis.setIntegrationState=delta=>setState(old=>({...old,...delta}));return <Context.Provider value={state}>{children}</Context.Provider>;}
export const useFixture=()=>React.useContext(Context);
export const router={push:value=>events.push({name:'push',value}),replace:value=>events.push({name:'replace',value}),dismissTo:value=>events.push({name:'dismissTo',value}),canGoBack:()=>globalThis.qcCanGoBack??true,back:()=>events.push({name:'back'})};
export const useLocalSearchParams=()=>useFixture().params;
export const useGlobalSearchParams=()=>useFixture().globalParams;
export const useIsFocused=()=>useFixture().focused;
export const useFocusEffect=callback=>{const s=useFixture();React.useEffect(()=>s.focused?callback():undefined,[s.focused,callback]);};
export const Link=({children})=>children;
export const haptic={light:()=>{},selection:()=>{},medium:()=>{},heavy:()=>{},warning:()=>{},success:()=>{},error:()=>{}};
export function JSStack({children}){const s=useFixture(),name=s.routeName||'index',child=React.Children.toArray(children).find(c=>c.props.name===name);return child?.props.options.header?.()??null;}
JSStack.Screen=()=>null;
export const ScaleBackTransition={};

export const delayedBack=()=>events.push({name:"delayedBack"});


export const useAppModeStore=selector=>selector({mode:"cashier"});
export const useRouter=()=>router;
