import React from "react";
import { createRoot } from "react-dom/client";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { SafeAreaProvider, SafeAreaInsetsContext } from "react-native-safe-area-context";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import CashInput from "@/app/(no-layout)/(cashier)/cart/input-money";
import CartLayout from "@/app/(no-layout)/(cashier)/cart/_layout";
function Preview(){
 const [tick,setTick]=React.useState(0);globalThis.__cashUpdate=()=>setTick(value=>value+1);
 const Screen=CashInput;
 const [loaded]=useFonts({InterRegular:require('@/assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('@/assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('@/assets/fonts/Inter_24pt-SemiBold.ttf')});
 if(!loaded)return null;
 return <SafeAreaProvider key={tick} initialMetrics={{frame:{x:0,y:0,width:globalThis.innerWidth,height:globalThis.innerHeight},insets:globalThis.__cashFixture.insets}}>
  <SafeAreaInsetsContext.Provider value={globalThis.__cashFixture.insets}><GluestackUIProvider mode="light"><View style={{flex:1}}><CartLayout/><Screen/></View></GluestackUIProvider></SafeAreaInsetsContext.Provider>
 </SafeAreaProvider>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
