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
import List from '../../../../app/(no-layout)/inventory/stock-movement';
import Detail from '../../../../app/(no-layout)/inventory/stock-movement/detail';
import InventoryHub from '../../../../app/(back-office)/inventory';
import {useInventoryStore} from '../../../../store/inventoryStore';
import {useInventoryMaterialStore} from '../../../../store/inventoryMaterialStore';
import {buildStockMovements} from '../../../../lib/inventory-stock-movement';

// Isolated browser navigator and session fixtures, never application/store files.
const initialInventory=useInventoryStore.getState(),initialMaterials=useInventoryMaterialStore.getState();
window.sd6Routes=[];
let navigate;
router.push=href=>{window.sd6Routes.push({action:'push',href:String(href)});navigate(String(href));};
router.replace=href=>{window.sd6Routes.push({action:'replace',href:String(href)});navigate(String(href));};
window.sd6Reset=()=>{useInventoryStore.setState({stockRecords:initialInventory.stockRecords,purchases:initialInventory.purchases});useInventoryMaterialStore.setState({materials:initialMaterials.materials});};
window.sd6Rows=()=>buildStockMovements({stockRecords:useInventoryStore.getState().stockRecords,purchases:useInventoryStore.getState().purchases,materials:useInventoryMaterialStore.getState().materials});
window.sd6Data=data=>{if(data.stockRecords)useInventoryStore.setState({stockRecords:data.stockRecords});if(data.purchases)useInventoryStore.setState({purchases:data.purchases});if(data.materials)useInventoryMaterialStore.setState({materials:data.materials});};
function Preview(){
 const [entry,setEntry]=React.useState({screen:'list',params:{},key:0});
 const [loaded]=useFonts({InterRegular:require('../../../../assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('../../../../assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('../../../../assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('../../../../assets/fonts/Inter_24pt-Bold.ttf')});
 navigate=href=>{const url=new URL(href,'http://fixture.local');setEntry(old=>({screen:url.pathname.endsWith('/detail')?'detail':url.pathname==='/inventory'?'hub':'list',params:Object.fromEntries(url.searchParams),key:old.key+1}));};
 window.sd6Scenario=(screen,params={})=>setEntry(old=>({screen,params,key:old.key+1}));
 window.sd6Params=params=>setEntry(old=>({...old,params}));
 if(!loaded)return null;
 const Screen=entry.screen==='detail'?Detail:entry.screen==='hub'?InventoryHub:List;
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><GluestackUIProvider mode="light"><View style={{flex:1}}>
 <Header title={entry.screen==='detail'?'Detail Mutasi Stok':entry.screen==='hub'?'Persediaan':'Riwayat Mutasi Stok'} back={()=>navigate('/inventory/stock-movement')}/>
 <LocalRouteParamsContext.Provider value={entry.params}><Screen key={entry.key}/></LocalRouteParamsContext.Provider>
 </View></GluestackUIProvider></SafeAreaProvider></GestureHandlerRootView>;
}
registerRootComponent(Preview);
