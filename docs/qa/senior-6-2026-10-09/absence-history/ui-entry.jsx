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
import List from '../../../../app/(absence)/history';
import Detail from '../../../../app/(absence)/history/detail';
import {useAbsenceStore} from '../../../../store/useAbsenceStore';

// Browser-local navigation, fixtures, and transport; application files are never mutated.
window.sd6Routes=[];
let navigate;
const initial=useAbsenceStore.getState().records;
router.push=href=>{window.sd6Routes.push({action:'push',href:String(href)});navigate(String(href));};
router.replace=href=>{window.sd6Routes.push({action:'replace',href:String(href)});navigate(String(href));};
window.sd6Data=records=>useAbsenceStore.setState({records});
window.sd6Reset=()=>window.sd6Data(initial);
function Preview(){
 const [entry,setEntry]=React.useState({screen:'list',params:{},key:0});
 const [loaded]=useFonts({InterRegular:require('../../../../assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('../../../../assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('../../../../assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('../../../../assets/fonts/Inter_24pt-Bold.ttf')});
 navigate=href=>{const url=new URL(href,'http://fixture.local');setEntry(old=>({screen:url.pathname.endsWith('/detail')?'detail':'list',params:Object.fromEntries(url.searchParams),key:old.key+1}));};
 window.sd6Scenario=(screen,params={})=>setEntry(old=>({screen,params,key:old.key+1}));
 window.sd6Params=params=>setEntry(old=>({...old,params}));
 if(!loaded)return null;
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><GluestackUIProvider mode="light"><View style={{flex:1}}>
 <Header title={entry.screen==='detail'?'Detail Riwayat Absensi':'Riwayat Absensi'} back={()=>navigate('/(absence)/history')}/>
 <View style={{flex:1,display:entry.screen==='list'?'flex':'none'}}><List/></View>
 {entry.screen==='detail'&&<LocalRouteParamsContext.Provider value={entry.params}><Detail key={entry.key}/></LocalRouteParamsContext.Provider>}
 </View></GluestackUIProvider></SafeAreaProvider></GestureHandlerRootView>;
}
registerRootComponent(Preview);
