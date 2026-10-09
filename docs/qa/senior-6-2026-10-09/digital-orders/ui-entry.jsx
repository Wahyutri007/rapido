import React from 'react';
import {registerRootComponent} from 'expo';
import {useFonts} from 'expo-font';
import {router} from 'expo-router';
import {LocalRouteParamsContext} from 'expo-router/build/Route';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {View} from 'react-native';
import Header from '../../../../components/common/Header';
import {GluestackUIProvider} from '../../../../components/ui/gluestack-ui-provider';
import List from '../../../../app/(no-layout)/manage/pos-settings/digital-orders';
import Modify from '../../../../app/(no-layout)/manage/pos-settings/digital-orders/modify';
import Detail from '../../../../app/(no-layout)/manage/pos-settings/digital-orders/detail';
import Pos from '../../../../app/(no-layout)/manage/pos-settings';
import {useDigitalOrderChannelStore} from '../../../../store/digitalOrderChannelStore';
// Isolated navigation and session data; no application-source fixture changes.
window.sd6Routes=[];let navigate;
for(const action of ['push','replace','dismissTo'])router[action]=href=>{window.sd6Routes.push({action,href:String(href)});navigate(String(href));};
window.sd6Rows=()=>useDigitalOrderChannelStore.getState().items;
window.sd6Reset=()=>useDigitalOrderChannelStore.setState({items:[],nextId:1});
window.sd6Add=value=>useDigitalOrderChannelStore.getState().add(value);
window.sd6Update=(id,revision,values)=>useDigitalOrderChannelStore.getState().update(id,revision,values);
window.sd6Remove=(id,revision)=>useDigitalOrderChannelStore.getState().remove(id,revision);
function Preview(){
 const [entry,setEntry]=React.useState({screen:'pos',params:{},key:0});
 const [loaded]=useFonts({InterRegular:require('../../../../assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('../../../../assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('../../../../assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('../../../../assets/fonts/Inter_24pt-Bold.ttf')});
 navigate=href=>{const u=new URL(href,'http://fixture.local');setEntry(old=>({screen:u.pathname.endsWith('/modify')?'modify':u.pathname.endsWith('/detail')?'detail':u.pathname.endsWith('/pos-settings')?'pos':'list',params:Object.fromEntries(u.searchParams),key:old.key+1}));};
 window.sd6Scenario=(screen,params={})=>setEntry(old=>({screen,params,key:old.key+1}));
 window.sd6Params=params=>setEntry(old=>({...old,params}));
 if(!loaded)return null;
 const Screen=entry.screen==='pos'?Pos:entry.screen==='detail'?Detail:Modify;
 const title=entry.screen==='list'?'Pesanan Digital':entry.screen==='pos'?'Pengaturan POS':entry.screen==='detail'?'Detail Kanal Pemesanan':entry.params.id===undefined?'Tambah Kanal Pemesanan':'Edit Kanal Pemesanan';
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><GluestackUIProvider mode="light"><View style={{flex:1}}>
 <Header title={title} back={()=>navigate(entry.screen==='list'?'/manage/pos-settings':'/manage/pos-settings/digital-orders')}/>
 <View style={{flex:1,display:entry.screen==='list'?'flex':'none'}}><List/></View>
 {entry.screen!=='list'&&<LocalRouteParamsContext.Provider value={entry.params}><Screen key={entry.key}/></LocalRouteParamsContext.Provider>}
 </View></GluestackUIProvider></SafeAreaProvider></GestureHandlerRootView>;
}
registerRootComponent(Preview);
