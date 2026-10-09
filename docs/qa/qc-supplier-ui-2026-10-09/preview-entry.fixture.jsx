import '../global.css';
import React from 'react';
import { registerRootComponent } from 'expo';
import { useFonts } from 'expo-font';
import { ExpoRoot, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider';
import SupplierLayout from '../app/(no-layout)/inventory/suppliers/_layout';
import SupplierList from '../app/(no-layout)/inventory/suppliers/index';
import SupplierForm from '../app/(no-layout)/inventory/suppliers/modify';
import SupplierDetail from '../app/(no-layout)/inventory/suppliers/detail';
import { DEFAULT_SUPPLIERS } from '../constants/data/inventory-suppliers';
import { useInventorySupplierStore } from '../store/inventorySupplierStore';
import { useInventoryStore } from '../store/inventoryStore';

// These state changes affect this isolated browser only, never device/backend state.
const base = DEFAULT_SUPPLIERS.find(item => item.id === 'supplier-baju');
const long = { ...base, id: 'qc-long', name: 'Pemasok Distribusi Bahan Baku dan Perlengkapan Usaha dengan Nama Panjang',
  address: 'Jalan Pemasok Distribusi Bahan Baku nomor 123, Kompleks Perdagangan dan Perlengkapan Usaha, Pekanbaru, Riau',
  email: 'kontakpembeliandistribusibahanbakudankebutuhanusaha@contohpemasok.co.id',
  phone: '+62 812-3456-7890', products: ['Bahan baku serta perlengkapan usaha dengan nama produk panjang'], priorPurchaseTotal: 154000000 };
const inactive = { ...base, id: 'qc-inactive', name: 'Pemasok Tidak Aktif', active: false, primary: false, priorPurchaseTotal: 99999999999 };
window.qcSupplierUi = {
  long,
  seed(mode = 'long') {
    useInventorySupplierStore.setState({ suppliers: mode === 'empty' ? [] : mode === 'normal' ? DEFAULT_SUPPLIERS.map(item => ({ ...item })) : [{ ...long }, { ...inactive }], sequence: 100 });
    useInventoryStore.setState({ purchases: mode === 'protected' ? [{ id: 'qc-purchase', supplierId: long.id, supplier: long.name, status: 'draft', amount: 20000 }] : [] });
  },
  suppliers: () => useInventorySupplierStore.getState().suppliers,
};
window.qcSupplierUi.seed(window.qcSupplierUiMode || 'long');
function Layout() { return <Stack screenOptions={{ headerShown: false }} />; }
const modules = { './_layout.tsx': { default: Layout }, './index.tsx': { default: SupplierList },
  './inventory/suppliers/_layout.tsx': { default: SupplierLayout }, './inventory/suppliers/index.tsx': { default: SupplierList },
  './inventory/suppliers/modify.tsx': { default: SupplierForm }, './inventory/suppliers/detail.tsx': { default: SupplierDetail } };
const context = key => modules[key]; context.keys = () => Object.keys(modules); context.resolve = key => key; context.id = 'qc-supplier-ui';
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function Preview() {
  const [loaded] = useFonts({ InterRegular: require('../assets/fonts/Inter_24pt-Regular.ttf'), InterMedium: require('../assets/fonts/Inter_24pt-Medium.ttf'), InterSemiBold: require('../assets/fonts/Inter_24pt-SemiBold.ttf'), InterBold: require('../assets/fonts/Inter_24pt-Bold.ttf') });
  if (!loaded) return null;
  return <SafeAreaProvider><GluestackUIProvider mode="light"><QueryClientProvider client={client}><View style={{ flex: 1 }}><ExpoRoot context={context} /></View></QueryClientProvider></GluestackUIProvider></SafeAreaProvider>;
}
registerRootComponent(Preview);
