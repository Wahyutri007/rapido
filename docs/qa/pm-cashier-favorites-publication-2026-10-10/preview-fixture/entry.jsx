import React from 'react';
import {createRoot} from 'react-dom/client';
import {View} from 'react-native';
import {useFonts} from 'expo-font';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import FavoriteSection from './home-fragment';
import {state} from './router';
globalThis.__fixture=state;
function Preview(){const [narrow,setNarrow]=React.useState(null);globalThis.__narrow=setNarrow;
const [loaded]=useFonts({InterRegular:require('@/assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('@/assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('@/assets/fonts/Inter_24pt-SemiBold.ttf')});if(!loaded)return null;
return <SafeAreaProvider initialMetrics={{frame:{x:0,y:0,width:innerWidth,height:innerHeight},insets:{top:0,bottom:0,left:0,right:0}}}><GluestackUIProvider mode="light"><View style={{flex:1}}><View style={{width:narrow||'100%'}}><FavoriteSection/></View></View></GluestackUIProvider></SafeAreaProvider>;}
createRoot(document.getElementById('root')).render(<Preview/>);
