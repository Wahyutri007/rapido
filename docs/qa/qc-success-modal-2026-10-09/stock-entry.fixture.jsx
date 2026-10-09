import '../global.css';
import React from 'react';
import {registerRootComponent} from 'expo';
import {useFonts} from 'expo-font';
import {ExpoRoot, Stack} from 'expo-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {View} from 'react-native';
import Header from '../components/common/Header';
import {GluestackUIProvider} from '../components/ui/gluestack-ui-provider';
import StockScreen from '../app/(no-layout)/manage/pos-settings/stock-limit';

import apiClient from '../api/axios';

// Frontend visual fixture only: every data operation terminates in this browser.
const baseMenus = [{id:'menu-1',name:'Kopi Susu'}, {id:'menu-2',name:'Produk dengan nama panjang untuk memeriksa pembungkusan teks pada layar kecil dan pilihan kategori'}];
const baseCategories = [{id:'category-1',name:'Minuman'}, {id:'category-2',name:'Kategori dengan nama panjang untuk memeriksa tampilan daftar dan pilihan pada layar kecil'}];
let fixture = {mode:'item', saveFailure:false};
const settings = () => ({enabled:true,type:'hybrid',content_type:fixture.mode === 'category' ? 'category' : 'item',details:[{stockable_id:fixture.mode === 'category' ? 'category-1' : 'menu-1', stockable_type:fixture.mode === 'category' ? 'category' : 'menu'}]});
window.qcUiCalls = [];
apiClient.defaults.adapter = async config => {
  const domain = config.url.includes('stock-settings') ? 'settings' : config.url.includes('categories') ? 'categories' : config.url.includes('menus') ? 'menus' : 'unexpected';
  window.qcUiCalls.push({domain,method:config.method});
  if (domain === 'unexpected') throw Error('Unexpected frontend fixture domain');
  if (config.method !== 'get') return {data:{success:!fixture.saveFailure, status:fixture.saveFailure ? 500 : 200, data:settings()},status:200,statusText:'Fixture',headers:{},config};
  if ((fixture.mode === 'settings-loading' && domain === 'settings') || (fixture.mode === 'list-loading' && domain === 'menus')) return new Promise(()=>{});
  if ((fixture.mode === 'settings-error' && domain === 'settings') || (fixture.mode === 'list-error' && domain === 'menus')) return {data:{success:false,status:500},status:200,statusText:'Fixture',headers:{},config};
  const data = domain === 'settings' ? settings() : fixture.mode === 'empty' ? [] : domain === 'categories' ? baseCategories : baseMenus;
  return {data:{success:true,status:200,data},status:200,statusText:'Fixture',headers:{},config};
};
const client = new QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,retryOnMount:false,refetchOnWindowFocus:false}}});
function Layout() {return <Stack screenOptions={{header:()=> <Header title="Pengaturan Batas Stok" back />}}/>;}
const RenderScreen = StockScreen;
const modules = {'./_layout.tsx':{default:Layout}, './index.tsx':{default:RenderScreen}, './manage/pos-settings/stock-limit.tsx':{default:RenderScreen}};
const context = key => modules[key]; context.keys=()=>Object.keys(modules); context.resolve=key=>key; context.id='qc-stock-ui';
function Preview() {
  const [identity,setIdentity] = React.useState(0);
  const [loaded] = useFonts({InterRegular:require('../assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('../assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('../assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('../assets/fonts/Inter_24pt-Bold.ttf')});
  window.qcUiScenario = (mode,saveFailure=false) => {fixture={mode,saveFailure}; client.clear(); setIdentity(i=>i+1);};
  if(!loaded) return null;
  return <SafeAreaProvider><GluestackUIProvider mode="light"><QueryClientProvider client={client}><View style={{flex:1}}><ExpoRoot key={identity} context={context}/></View></QueryClientProvider></GluestackUIProvider></SafeAreaProvider>;
}
registerRootComponent(Preview);
