import React from 'react';
import {createRoot} from 'react-dom/client';
import {View} from 'react-native';
import {useFonts} from 'expo-font';
import {SafeAreaProvider,SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import BeforeStock from '../before/components/feature/cashier/stock/CashierStockScreen.tsx';
import BeforeSearch from '../before/components/common/SearchBar.tsx';
import CurrentSearch from '@/components/common/SearchBar';
import Stock from '@/app/(no-layout)/(cashier)/stock';
import Layout from '@/app/(no-layout)/(cashier)/_layout';
import Printer from '@/app/(no-layout)/manage/printer/index';
import PrinterLayout from '@/app/(no-layout)/manage/printer/_layout';
import * as BeforeSheet from '../before/components/ui/actionsheet';
import * as CurrentSheet from '@/components/ui/actionsheet';
import Text from '@/components/common/Text';
import {Button,ButtonText} from '@/components/ui/button';
function SheetLab(){const fixture=globalThis.__pmStock,Sheet=fixture.mode==='before-sheet'?BeforeSheet:CurrentSheet;const [open,setOpen]=React.useState(false);return <><Button onPress={()=>setOpen(true)}><ButtonText>Buka panel</ButtonText></Button><Sheet.Actionsheet isOpen={open} onClose={()=>setOpen(false)}><Sheet.ActionsheetBackdrop/><Sheet.ActionsheetContent testID="sheet-lab" bottomInsetHandled={fixture.handled}><Sheet.ActionsheetDragIndicatorWrapper><Sheet.ActionsheetDragIndicator/></Sheet.ActionsheetDragIndicatorWrapper><Text>Panel pembanding</Text><Button onPress={()=>setOpen(false)}><ButtonText>Tutup panel</ButtonText></Button></Sheet.ActionsheetContent></Sheet.Actionsheet></>;}
function SearchLab(){const f=globalThis.__pmStock,[search,setSearch]=React.useState('initial'),Search=f.before?BeforeSearch:CurrentSearch;return <View style={{padding:16}}><Search search={search} setSearch={value=>{setSearch(value);f.searchEvents.push(value)}} debounce={false} appearance={f.appearance||'default'} withSort={f.action==='sort'} withFilter={f.action==='filter'} onSortPress={()=>f.actionEvents.push('sort')} onFilterPress={()=>f.actionEvents.push('filter')}/><Text testID="search-value">{search}</Text><Button onPress={()=>setSearch('external')}><ButtonText>External</ButtonText></Button><Button onPress={()=>setSearch('')}><ButtonText>Clear</ButtonText></Button></View>;}
function Preview(){
 const fixture=globalThis.__pmStock;const [,refresh]=React.useState(0);globalThis.__pmRefresh=()=>refresh(n=>n+1);
 const [loaded]=useFonts({InterRegular:require('@/assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('@/assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('@/assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('@/assets/fonts/Inter_24pt-Bold.ttf'),Entypo:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf'),Feather:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf')});if(!loaded)return null;
 const content=fixture.mode==='search-lab'?<SearchLab/>:fixture.mode==='before-stock'?<><Layout/><BeforeStock/></>:fixture.mode==='printer'?<><PrinterLayout/><Printer/></>:fixture.mode.endsWith('sheet')?<SheetLab/>:<><Layout/><Stock/></>;
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><SafeAreaInsetsContext.Provider value={fixture.insets}><GluestackUIProvider mode="light"><View testID="fixture-ready" style={{flex:1}}>{content}</View></GluestackUIProvider></SafeAreaInsetsContext.Provider></SafeAreaProvider></GestureHandlerRootView>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
