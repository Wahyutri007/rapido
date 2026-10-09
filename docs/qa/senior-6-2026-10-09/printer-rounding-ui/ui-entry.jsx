import '../global.css';
import React from 'react';
import {registerRootComponent} from 'expo';
import {useFonts} from 'expo-font';
import {router} from 'expo-router';
import {LocalRouteParamsContext} from 'expo-router/build/Route';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {View} from 'react-native';
import Header from '../components/common/Header';
import {GluestackUIProvider} from '../components/ui/gluestack-ui-provider';
import Rounding from '../app/(no-layout)/manage/pos-settings/rounding';
import Printer from '../app/(no-layout)/manage/printer/modify';
import apiClient from '../api/axios';

// Browser-local transport; no application/backend fixture changes.
let fixture={record:{enabled:true,method:'nearest',decimal_places:2},fail:false};
window.sd6Calls=[];
window.sd6BackCount=0;
router.back=()=>{window.sd6BackCount++;};
router.push=href=>{window.sd6LastRoute=String(href);};
apiClient.defaults.adapter=async config=>{
  if(!config.url.includes('rounding-settings')) throw Error('Unexpected fixture endpoint');
  const body=config.method==='get'?undefined:typeof config.data==='string'?JSON.parse(config.data):config.data;
  window.sd6Calls.push({method:config.method,body});
  if(config.method!=='get'&&!fixture.fail)fixture.record=body;
  return {data:{success:!(config.method!=='get'&&fixture.fail),status:fixture.fail?500:200,data:fixture.record},status:200,statusText:'Fixture',headers:{},config};
};
const client=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,refetchOnWindowFocus:false}}});
function Preview(){
  const [entry,setEntry]=React.useState({screen:'rounding',params:{},identity:0});
  const [loaded]=useFonts({InterRegular:require('../assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('../assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('../assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('../assets/fonts/Inter_24pt-Bold.ttf')});
  window.sd6Scenario=(screen,record={enabled:true,method:'nearest',decimal_places:2},params={})=>{
    fixture={record,fail:false};client.clear();setEntry(previous=>({screen,params,identity:previous.identity+1}));
  };
  window.sd6Params=params=>setEntry(previous=>({...previous,params}));
  window.sd6Refetch=record=>{fixture.record=record;return client.refetchQueries({type:'active'});};
  window.sd6FailSave=()=>{fixture.fail=true;};
  if(!loaded)return null;
  const Screen=entry.screen==='printer'?Printer:Rounding;
  return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><GluestackUIProvider mode="light"><QueryClientProvider client={client}><View style={{flex:1}}>
    <Header title={entry.screen==='printer'?'Printer':'Pembulatan'} back={()=>router.back()}/>
    <LocalRouteParamsContext.Provider value={entry.params}><Screen key={entry.screen+':'+entry.identity}/></LocalRouteParamsContext.Provider>
  </View></QueryClientProvider></GluestackUIProvider></SafeAreaProvider></GestureHandlerRootView>;
}
registerRootComponent(Preview);
