export const events=[];
window.billEvents=events;
export const router={push:value=>events.push(['push',value]),replace:value=>events.push(['replace',value]),back:()=>events.push(['back']),canGoBack:()=>false};
export const useRouter=()=>router;
export const useLocalSearchParams=()=>({});
export const haptic={light:()=>{},selection:()=>{},medium:()=>{},success:()=>{},error:()=>{}};

export const useIsFocused=()=>true;
