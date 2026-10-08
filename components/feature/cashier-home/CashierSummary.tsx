import { useLatestStoreShiftQuery } from "@/api/hooks/store-shift";
import { useCurrentStoreQuery } from "@/api/hooks/stores";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { tw } from "@/lib/utils";
import { StoreShiftData } from "@/types/api/store-shift";
import { AntDesign, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";
import ChangeStoreButton from "@/components/custom/ChangeStoreButton";
import OpenStoreButton from "./OpenStoreButton";

type SummaryItemProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function SummaryItem(props: SummaryItemProps) {
  const { icon, title, value } = props;

  return (
    <View className="flex-1 flex-row items-center gap-4">
      <View className="size-8 items-center justify-center rounded-full">
        {icon}
      </View>
      <View>
        <Text className="text-xs text-zinc-700">{title}</Text>
        <Text className="mt-1 text-primary" w="medium">
          {value}
        </Text>
      </View>
    </View>
  );
}

function CashierSummaryGrid(props: {
  query: UseQueryResult<StoreShiftData, Error>;
}) {
  const { query } = props;

  return (
    <View>
      <View className="flex-row gap-4">
        <SummaryItem
          title="Kas Awal"
          icon={<Entypo name="wallet" size={tw(5)} color={Colors.primary} />}
          value={
            query.isLoading
              ? "..."
              : `Rp ${query.data?.opening_cash?.toLocaleString("id-ID")}`
          }
        />
        <View className="w-px bg-zinc-100" />
        <SummaryItem
          title="Penjualan"
          icon={
            <FontAwesome6
              name="clipboard-check"
              size={tw(5)}
              color={Colors.primary}
            />
          }
          value={
            query.isLoading
              ? "..."
              : `Rp ${query.data?.total_sales?.toLocaleString("id-ID")}`
          }
        />
      </View>
      <View className="flex-row gap-4">
        <View className="my-4 h-px flex-1 bg-zinc-100" />
        <View className="w-px" />
        <View className="my-4 h-px flex-1 bg-zinc-100" />
      </View>
      <View className="flex-row gap-4">
        <SummaryItem
          title="Kas Sekarang"
          icon={<Entypo name="wallet" size={tw(5)} color={Colors.primary} />}
          value="-1"
        />
        <View className="w-px bg-zinc-100" />
        <SummaryItem
          title="Pengeluaran"
          value="-1"
          icon={
            <FontAwesome6
              name="clipboard-check"
              size={tw(5)}
              color={Colors.primary}
            />
          }
        />
      </View>
    </View>
  );
}

export default function CashierSummary() {
  const storeQuery = useCurrentStoreQuery();
  const storeShiftQuery = useLatestStoreShiftQuery();
  const { user, hasRole } = useAuth();

  return (
    <View className="rounded-xl bg-white p-4 shadow-main">
      <View className="mb-4 flex-row items-center justify-between border-b border-zinc-100 pb-3">
        <View>
          <Text className="text-xs text-zinc-500">Toko Aktif</Text>
          <Text w="semibold" className="text-base text-primary">
            {storeQuery.isLoading ? "Memuat..." : storeQuery.data?.name}
          </Text>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1">
          <Text className="text-[10px] uppercase text-primary" w="bold">
            {user?.roles[0]}
          </Text>
        </View>
      </View>

      {storeShiftQuery.isLoading ? (
        <View className="flex-row items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <Text className="text-xs text-zinc-700">Loading...</Text>
        </View>
      ) : storeShiftQuery.isError ? (
        <View className="flex-row items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <AntDesign name="info-circle" size={tw(4)} color={Colors.zinc[400]} />
          <Text className="text-xs text-zinc-700">
            <Text w="medium">Toko belum dibuka</Text>, silahkan buka toko
            terlebih dahulu untuk memulai transaksi
          </Text>
        </View>
      ) : (
        <CashierSummaryGrid query={storeShiftQuery} />
      )}

      <View className="mt-4 flex-row items-center gap-4">
        {hasRole("owner") && <ChangeStoreButton />}
        <OpenStoreButton />
      </View>
    </View>
  );
}
