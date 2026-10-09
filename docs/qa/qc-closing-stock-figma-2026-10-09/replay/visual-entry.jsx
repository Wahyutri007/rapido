import "@/components/icons";
import { AppRegistry, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import React from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import Header from "@/components/common/Header";
import BottomTab from "@/components/custom/BottomTab";
import ClosingStockScreen from "@/components/feature/inventory/closing-stock/ClosingStockScreen";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";

// Figma example values exist only in this isolated comparison page, never application seeds.
const inventory=require("@/lib/inventory");
const originalItems=inventory.getInventoryItems;
const originalMaterials=useInventoryMaterialStore.getState().materials;
const examples=[
  ['Pizza politan','Size L',20,'Pcs','Makanan'],['Pizza politan','Size M',15,'Pcs','Makanan'],
  ['Teh Es','',200,'Cup','Makanan'],['Sushi','',2,'Pcs','Makanan'],
  ['Salad Yumme','',0,'Pcs','Makanan'],['Mie Goreng Dumai','',0,'Pcs','Makanan'],['Roti Sosis Jumbo','',0,'Pcs','Makanan'],
  ['Teh Sisri','Size L',20,'Pcs','Minuman'],['Pop Ice','',15,'Pcs','Minuman'],['Teh Es','',200,'Cup','Minuman'],['Roti Sosis Jumbo','',0,'Pcs','Minuman']
].map(([name,sku,stock,unit,category],index)=>({id:'figma-'+index,name,sku,stock,unit,category,kind:index===3?'material':'product'}));
globalThis.__sd5FigmaRows=examples;
inventory.getInventoryItems=materials=>globalThis.__sd5FigmaRows??originalItems(materials);
useInventoryMaterialStore.setState({materials:[...originalMaterials,{...originalMaterials[0],id:'figma-3',name:'Sushi',sku:'',stock:2,minimumStock:3}]});
globalThis.__sd5InventoryMaterials=useInventoryMaterialStore;
globalThis.__sd5UseActual=()=>{globalThis.__sd5FigmaRows=null;useInventoryMaterialStore.setState({materials:[...originalMaterials]});};
const names=['home','report','catalog','inventory','manage'];
const labels=['Beranda','Laporan','Katalog','Inventory','Kelola'];
const routes=names.map(name=>({name,key:name}));
const descriptors=Object.fromEntries(names.map((name,index)=>[name,{options:{tabBarLabel:labels[index]}}]));
globalThis.__sd5Navigation=[];
function Preview(){
  const [loaded,error]=useFonts({InterRegular:require('../../../../assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('../../../../assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('../../../../assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('../../../../assets/fonts/Inter_24pt-Bold.ttf')});
  if(error)throw error;if(!loaded)return null;
  return <SafeAreaProvider initialMetrics={{frame:{x:0,y:0,width:390,height:1347},insets:{top:0,left:0,right:0,bottom:0}}}><GluestackUIProvider mode="light"><View style={{flex:1}}><Header appearance="figma" title="Stok Akhir" back={()=>globalThis.__sd5Navigation.push('back')} /><ClosingStockScreen /><BottomTab appearance="figma" state={{index:3,routes}} descriptors={descriptors} navigation={{navigate:name=>globalThis.__sd5Navigation.push(name)}} /></View></GluestackUIProvider></SafeAreaProvider>;
}
AppRegistry.registerComponent('SD5Visual',()=>Preview);
AppRegistry.runApplication('SD5Visual',{rootTag:document.getElementById('root')});
