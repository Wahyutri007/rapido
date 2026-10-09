import React from 'react';
import {createRoot} from 'react-dom/client';
import {View} from 'react-native';
import {useFonts} from 'expo-font';
import {SafeAreaProvider,SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import List from '@/app/(no-layout)/manage/printer/index';
import Modify from '@/app/(no-layout)/manage/printer/modify';
import Layout from '@/app/(no-layout)/manage/printer/_layout';
import BeforeModify from '../before/app/(no-layout)/manage/printer/modify';
function Preview(){
 const fixture=globalThis.__pmPrinter;const [,refresh]=React.useState(0);globalThis.__pmRefresh=()=>refresh(n=>n+1);globalThis.__pmParams=params=>{fixture.params=params;refresh(n=>n+1);};globalThis.__pmMode=mode=>{fixture.appMode=mode;refresh(n=>n+1);};
 const [loaded]=useFonts({InterRegular:require('@/assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('@/assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('@/assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('@/assets/fonts/Inter_24pt-Bold.ttf'),Entypo:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf'),Feather:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf')});if(!loaded)return null;
 const Screen=fixture.mode==='modify'?(fixture.before?BeforeModify:Modify):List;
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><SafeAreaInsetsContext.Provider value={fixture.insets}><GluestackUIProvider mode="light"><View testID="fixture-ready" style={{flex:1}}><Layout/><Screen/></View></GluestackUIProvider></SafeAreaInsetsContext.Provider></SafeAreaProvider></GestureHandlerRootView>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
