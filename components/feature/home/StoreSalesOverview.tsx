import Text from "@/components/common/Text"
import { useSecureStoreState } from "@/hooks/useSecureStore"
import { parseRp } from "@/lib/utils"
import { View } from "react-native"

export default function StoreSalesOverview() {
  // * Mock persistent data
  const [kasAwal, setKasAwal] = useSecureStoreState("kasAwal", "0")
  
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-muted w-1/2" w="medium">Tanggal Dimulai</Text>
        <Text className="text-muted w-1/2" w="medium">: 24/04/2025</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted w-1/2" w="medium">Waktu Dimulai</Text>
        <Text className="text-muted w-1/2" w="medium">: 09.00.00</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted w-1/2" w="medium">Waktu Selesai</Text>
        <Text className="text-muted w-1/2" w="medium">: 22.00.01</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted w-1/2" w="medium">Uang Kas Awal</Text>
        <Text className="text-muted w-1/2" w="medium">: {parseRp(kasAwal)}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted w-1/2" w="medium">Total Pendapatan</Text>
        <Text className="text-muted w-1/2" w="medium">: Rp 5.000.000</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted w-1/2" w="medium">Total Penjualan</Text>
        <Text className="text-muted w-1/2" w="medium">: 60</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted w-1/2" w="medium">Rata-Rata Penjualan</Text>
        <Text className="text-muted w-1/2" w="medium">: Rp 100.000</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted w-1/2" w="medium">Total Keuntungan</Text>
        <Text className="text-muted w-1/2" w="medium">: Rp 500.000</Text>
      </View>
    </View>
  );
}