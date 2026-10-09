import React from 'react';
import {createRoot} from 'react-dom/client';
import {View} from 'react-native';
import {useFonts} from 'expo-font';
import {SafeAreaProvider,SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import ScannerLayout from '@/app/(no-layout)/(cashier)/scanner/_layout';
import ScannerIndex from '@/app/(no-layout)/(cashier)/scanner/index';
import ScannerDetail from '@/app/(no-layout)/(cashier)/scanner/detail';
import Header from '@/components/common/Header';
import Wrapper from '@/components/common/Wrapper';
import Text from '@/components/common/Text';
import BaselineHeader from '../before/components/common/Header';
import {Button,ButtonText} from '@/components/ui/button';
function Preview(){
 const fixture=globalThis.__pmFixture;
 const [,refresh]=React.useState(0);
 globalThis.__pmRefresh=()=>refresh(n=>n+1);
 globalThis.__pmParams=params=>{fixture.params=params;refresh(n=>n+1);};
 const [loaded]=useFonts({InterRegular:require('@/assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('@/assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('@/assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('@/assets/fonts/Inter_24pt-Bold.ttf'),Entypo:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf'),Feather:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf')});
 if(!loaded)return null;
 let content;
 if(fixture.mode==='header-lab'){
  const props={title:fixture.title||'Laporan Shift',appearance:fixture.appearance,back:true,right:<Text>Pratinjau</Text>,titleClassName:'text-primary'};
  content=<><View testID="baseline-header"><BaselineHeader {...props}/></View><View testID="candidate-header"><Header {...props}/></View></>;
 }else if(fixture.mode==='wrapper-lab'){
  content=<Wrapper {...fixture.wrapperProps} contentContainerStyle={{padding:16,gap:16}}><View testID="wrapper-first" style={{height:80}}/><View style={{height:fixture.contentHeight||640}}/><Button onPress={()=>fixture.routes.push({action:'wrapper-action'})}><ButtonText>Aksi terakhir</ButtonText></Button></Wrapper>;
 }else{
  const Screen=fixture.mode==='scanner-detail'?ScannerDetail:ScannerIndex;
  content=<><ScannerLayout/><Screen/></>;
 }
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><SafeAreaInsetsContext.Provider value={fixture.insets}><GluestackUIProvider mode="light"><View testID="fixture-ready" style={{flex:1}}>{content}</View></GluestackUIProvider></SafeAreaInsetsContext.Provider></SafeAreaProvider></GestureHandlerRootView>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
