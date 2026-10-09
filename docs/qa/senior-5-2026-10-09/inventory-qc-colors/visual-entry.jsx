import "@/components/icons";
import React from "react";
import { AppRegistry, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import Header from "@/components/common/Header";
import { InventoryMetadata, InventoryMetrics } from "@/components/feature/inventory/InventoryUi";
import StockOperationDetail from "@/components/feature/inventory/StockOperationDetail";
import StockOperationList from "@/components/feature/inventory/StockOperationList";
import PurchaseListScreen from "@/components/feature/inventory/PurchaseListScreen";
import { useInventoryStore } from "@/store/inventoryStore";
globalThis.__sd5Navigation = [];
globalThis.__sd5InventoryStore = useInventoryStore;
const originalState = useInventoryStore.getState();
globalThis.__sd5Restore = () => useInventoryStore.setState(originalState);
const regressionItems = [
  {label:"QC warning default",value:123,icon:"box",tone:"warning"},
  {label:"QC success default",value:456,icon:"check-circle",tone:"success"},
  {label:"QC destructive default",value:789,icon:"alert-triangle",tone:"destructive"},
];
function Preview() {
  const [mode, setMode] = React.useState("adjustment");
  const [variant, setVariant] = React.useState("default");
  const [, setRevision] = React.useState(0);
  const [loaded, error] = useFonts({
    InterRegular: require("../../../../assets/fonts/Inter_24pt-Regular.ttf"),
    InterMedium: require("../../../../assets/fonts/Inter_24pt-Medium.ttf"),
    InterSemiBold: require("../../../../assets/fonts/Inter_24pt-SemiBold.ttf"),
    InterBold: require("../../../../assets/fonts/Inter_24pt-Bold.ttf"),
  });
  globalThis.__sd5Show = (nextMode, id, nextVariant = "default") => {
    globalThis.__sd5Params = {id};
    setVariant(nextVariant);
    setMode(nextMode);
    setRevision(value => value + 1);
  };
  globalThis.__sd5Params ??= {id:originalState.stockRecords.find(r=>r.operation==="adjustment").id};
  if (error) throw error;
  if (!loaded) return null;
  const title = mode === "adjustment" ? "Detail Penyesuaian Stok" : mode === "transfer" ? "Transfer Stok" : mode === "purchase" ? "Pembelian Barang" : "QC default consumers";
  return <SafeAreaProvider initialMetrics={{frame:{x:0,y:0,width:390,height:844},insets:{top:0,left:0,right:0,bottom:0}}}>
    <GluestackUIProvider mode="light"><View style={{flex:1}}>
      <Header title={title} back={() => globalThis.__sd5Navigation.push("back")} />
      {mode === "adjustment" || mode === "detail-transfer" ? <StockOperationDetail key={mode+globalThis.__sd5Params.id} operation={mode === "adjustment" ? "adjustment" : "transfer"} /> :
        mode === "transfer" || mode === "adjustment-list" ? <StockOperationList key={mode} operation={mode === "transfer" ? "transfer" : "adjustment"} /> :
        mode === "purchase" ? <PurchaseListScreen /> :
        <View style={{padding:16,gap:16}}>
          <InventoryMetrics variant={variant} items={regressionItems} />
          <InventoryMetadata icon="grid" label="QC metadata default" value="Current default" />
        </View>}
    </View></GluestackUIProvider>
  </SafeAreaProvider>;
}
AppRegistry.registerComponent("SD5InventoryQC", () => Preview);
AppRegistry.runApplication("SD5InventoryQC", {rootTag:document.getElementById("root")});
