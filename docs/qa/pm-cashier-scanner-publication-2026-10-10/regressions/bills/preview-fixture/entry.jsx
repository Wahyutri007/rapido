import React from 'react';
import {createRoot} from 'react-dom/client';
import {useFonts} from 'expo-font';
import {SafeAreaProvider,SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {View,Dimensions} from 'react-native';
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import Header from '@/components/common/Header';
import Screen from '@/app/(cashier)/biling';
import BillingLayout from '@/app/(cashier)/biling/_layout';
import BillReferenceCard from '@/components/feature/cashier/bills/BillReferenceCard';
import {Button,ButtonText} from '@/components/ui/button';
import BottomTab from '@/components/custom/BottomTab';
import {cashierBillTheme} from '@/lib/cashier/bill-theme';
import {BILL_REFERENCE_PREVIEW} from '@/lib/cashier/bill-reference-preview';
import {router} from './fixture';
const tabRoutes=[['home/index','Beranda'],['report','Laporan'],['catalog','Katalog'],['location/index','Tempat'],['biling','Tagihan']];
const routes=tabRoutes.map(([name])=>({key:name,name}));
const descriptors=Object.fromEntries(tabRoutes.map(([name,title])=>[name,{options:{title},navigation:{emit:()=>({defaultPrevented:false})}}]));
function Preview(){
 const [loaded]=useFonts({InterRegular:require('@/assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('@/assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('@/assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('@/assets/fonts/Inter_24pt-Bold.ttf')});
 const [insets,setInsets]=React.useState({top:32,bottom:0,left:0,right:0}); window.setBillEnvironment=(bottom,fontScale)=>{setInsets({top:32,bottom,left:0,right:0});Dimensions.get('window').fontScale=fontScale;Dimensions.get('screen').fontScale=fontScale;};
 const [mode,setMode]=React.useState('reference');window.setBillPreviewMode=setMode;
 if(!loaded)return null;
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider initialMetrics={{frame:{x:0,y:0,width:390,height:844},insets:{top:32,bottom:0,left:0,right:0}}}><SafeAreaInsetsContext.Provider value={insets}><GluestackUIProvider mode="light"><View style={{flex:1}}><BillingLayout/>{mode==='legacy'?<View style={cashierBillTheme} className="flex-1 gap-4 p-4"><Header title="Legacy Header"/><Button size="sm" variant="outline"><ButtonText>Default sm</ButtonText></Button><Button size="md"><ButtonText>Default md</ButtonText></Button><Button size="sm" isDisabled><ButtonText>Default disabled</ButtonText></Button></View>:mode==='stress'?<View style={cashierBillTheme} className="flex-1 bg-background p-4"><BillReferenceCard bill={{...BILL_REFERENCE_PREVIEW.cards[0],customer:'Pelanggan dengan nama sangat panjang untuk pemeriksaan layar kecil',table:'1234567890',total:Number.MAX_SAFE_INTEGER,date:'invalid',quantity:Number.MAX_SAFE_INTEGER,paidQuantity:undefined}} onAction={()=>{}}/></View>:<Screen/>}<BottomTab appearance="cashier" state={{routes,index:4}} descriptors={descriptors} navigation={{navigate:name=>window.billEvents.push(['tab',name]),emit:()=>({defaultPrevented:false})}}/></View></GluestackUIProvider></SafeAreaInsetsContext.Provider></SafeAreaProvider></GestureHandlerRootView>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
