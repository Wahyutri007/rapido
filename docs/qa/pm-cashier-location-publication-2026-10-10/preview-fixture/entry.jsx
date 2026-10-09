import React from 'react';
import {createRoot} from 'react-dom/client';
import {View} from 'react-native';
import {useFonts} from 'expo-font';
import {SafeAreaProvider,SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import TabsLayout from '@/app/(cashier)/_layout';
import DetailLayout from '@/app/(no-layout)/(cashier)/location/_layout';
import Location from '@/app/(cashier)/location';
import Detail from '@/app/(no-layout)/(cashier)/location/detail';
import BottomTab from '@/components/custom/BottomTab';
import BaselineBottomTab from '../before/components/custom/BottomTab';
function Footer(){return globalThis.__pmLocation.footer?.()??null;}
function FooterLab(){const f=globalThis.__pmLocation,p={...f.tabProps,appearance:f.appearance};return <View style={{flex:1}}><View testID="baseline-footer" style={{flex:1}}><BaselineBottomTab {...p}/></View><View testID="candidate-footer" style={{flex:1}}><BottomTab {...p}/></View></View>;}
function Preview(){
 const fixture=globalThis.__pmLocation;const [,refresh]=React.useState(0);
 globalThis.__pmRefresh=()=>refresh(n=>n+1);
 globalThis.__pmParams=params=>{fixture.params=params;refresh(n=>n+1);};
 const [loaded]=useFonts({InterRegular:require('@/assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('@/assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('@/assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('@/assets/fonts/Inter_24pt-Bold.ttf'),Feather:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),Entypo:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf')});
 if(!loaded)return null;
 const detail=fixture.mode==='location-detail';
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><SafeAreaInsetsContext.Provider value={fixture.insets}><GluestackUIProvider mode="light"><View testID="fixture-ready" style={{flex:1}}>{detail?<><DetailLayout/><Detail/></>:fixture.mode==='footer-lab'?<><TabsLayout/><FooterLab/></>:<><TabsLayout/><Location/><Footer/></>}</View></GluestackUIProvider></SafeAreaInsetsContext.Provider></SafeAreaProvider></GestureHandlerRootView>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
