import Header from "@/components/common/Header"
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function BackOfficeLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen name="manage" options={{ headerShown: false }} />
      <JSStack.Screen
        name="report/summary"
        options={{ header: () => <Header title="Laporan Ringkasan Bisnis" back /> }}
      />
      <JSStack.Screen
        name="report/operational-team"
        options={{ header: () => <Header title="Laporan Operasional & Tim" back /> }}
      />
      <JSStack.Screen
        name="report/purchase-supplier"
        options={{ header: () => <Header title="Laporan Pembelian & Pemasok" back /> }}
      />
      <JSStack.Screen
        name="report/product-stock"
        options={{ header: () => <Header title="Laporan Produk & Stok" back /> }}
      />
      <JSStack.Screen
        name="report/cash"
        options={{ header: () => <Header title="Laporan Kas & Transaksi" back /> }}
      />
      <JSStack.Screen
        name="report/customers-promos"
        options={{ header: () => <Header title="Laporan Pelanggan & Promo" back /> }}
      />
      <JSStack.Screen
        name="report/sales"
        options={{ header: () => <Header title="Laporan Penjualan & Keuntungan" back /> }}
      />
      <JSStack.Screen
        name="report/transaction"
        options={{ header: () => <Header title="Riwayat Transaksi" back /> }}
      />
      <JSStack.Screen
        name="report/accounting"
        options={{ headerShown: false }}
      />
    </JSStack>
  );
}
