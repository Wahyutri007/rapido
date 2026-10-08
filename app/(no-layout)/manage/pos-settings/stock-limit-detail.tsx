import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Colors } from "@/constants/Colors";

export default function StockLimitDetailScreen() {
	return (
		<Wrapper className="gap-4 px-4 pt-4 pb-8">
			{/* Section: Pengaturan Saat Ini */}
			<View className="gap-2">
				<View className="flex-row items-center justify-between">
					<Text size="normal" w="medium" className="text-muted">
						Pengaturan Saat Ini
					</Text>
					<View className="rounded-full bg-emerald-100 px-2.5 py-0.5">
						<Text size="small" w="semibold" className="text-emerald-700">
							Aktif
						</Text>
					</View>
				</View>

				<View className="rounded-xl border border-primary-500 bg-blue-50/60 p-4">
					<View className="flex-row items-center gap-2">
						<Feather name="check-circle" size={18} color={Colors.primary} />
						<Text w="bold" size="normal" className="text-primary">
							Batas Stock Aktif
						</Text>
					</View>
					<Text
						size="small"
						className="mt-2 leading-relaxed text-foreground/80"
					>
						Transaksi hanya bisa dilakukan sampai jumlah stock 0. Sistem akan
						menolak transaksi jika melebihi stock yang tersedia.
					</Text>
				</View>
			</View>

			{/* Section: Contoh Perilaku */}
			<View className="gap-3">
				<Text size="normal" w="semibold" className="text-foreground">
					Contoh Perilaku
				</Text>

				{/* Card 1: Batas Stock Aktif */}
				<View className="rounded-xl border border-emerald-300 bg-white p-3.5 shadow-main">
					<View className="mb-3 flex-row items-center gap-2">
						<Feather name="check-circle" size={16} color="#059669" />
						<Text w="bold" size="normal" className="text-emerald-700">
							Batas Stock Aktif
						</Text>
					</View>

					{/* Table */}
					<View className="overflow-hidden rounded-lg border border-zinc-200">
						<View className="flex-row bg-zinc-50 py-2 px-2 border-b border-zinc-200">
							<Text size="small" w="semibold" className="w-[28%] text-muted">
								Stok Tersedia
							</Text>
							<Text size="small" w="semibold" className="w-[26%] text-muted">
								Jumlah Jual
							</Text>
							<Text size="small" w="semibold" className="flex-1 text-muted">
								Hasil
							</Text>
						</View>

						<View className="flex-row py-2.5 px-2 border-b border-zinc-100">
							<Text size="small" className="w-[28%] text-foreground">
								10
							</Text>
							<Text size="small" className="w-[26%] text-foreground">
								5
							</Text>
							<Text size="small" className="flex-1 text-foreground">
								Transaksi berhasil (Sisa stok: 5)
							</Text>
						</View>

						<View className="flex-row py-2.5 px-2 border-b border-zinc-100">
							<Text size="small" className="w-[28%] text-foreground">
								2
							</Text>
							<Text size="small" className="w-[26%] text-foreground">
								2
							</Text>
							<Text size="small" className="flex-1 text-foreground">
								Transaksi berhasil (Sisa stok: 0)
							</Text>
						</View>

						<View className="flex-row py-2.5 px-2 bg-red-50/40">
							<Text size="small" className="w-[28%] text-foreground">
								0
							</Text>
							<Text size="small" className="w-[26%] text-foreground">
								1
							</Text>
							<Text size="small" w="medium" className="flex-1 text-red-600">
								Transaksi ditolak (Stock tidak mencukupi)
							</Text>
						</View>
					</View>
				</View>

				{/* Card 2: Batas Stock Nonaktif */}
				<View className="rounded-xl border border-red-300 bg-white p-3.5 shadow-main">
					<View className="mb-3 flex-row items-center gap-2">
						<Feather name="x-circle" size={16} color="#dc2626" />
						<Text w="bold" size="normal" className="text-red-600">
							Batas Stock Nonaktif
						</Text>
					</View>

					{/* Table */}
					<View className="overflow-hidden rounded-lg border border-zinc-200">
						<View className="flex-row bg-zinc-50 py-2 px-2 border-b border-zinc-200">
							<Text size="small" w="semibold" className="w-[28%] text-muted">
								Stok Tersedia
							</Text>
							<Text size="small" w="semibold" className="w-[26%] text-muted">
								Jumlah Jual
							</Text>
							<Text size="small" w="semibold" className="flex-1 text-muted">
								Hasil
							</Text>
						</View>

						<View className="flex-row py-2.5 px-2 border-b border-zinc-100">
							<Text size="small" className="w-[28%] text-foreground">
								10
							</Text>
							<Text size="small" className="w-[26%] text-foreground">
								5
							</Text>
							<Text size="small" className="flex-1 text-foreground">
								Transaksi berhasil (Sisa stock: 5)
							</Text>
						</View>

						<View className="flex-row py-2.5 px-2 border-b border-zinc-100">
							<Text size="small" className="w-[28%] text-foreground">
								2
							</Text>
							<Text size="small" className="w-[26%] text-foreground">
								2
							</Text>
							<Text size="small" className="flex-1 text-foreground">
								Transaksi berhasil (Sisa stock: 0)
							</Text>
						</View>

						<View className="flex-row py-2.5 px-2 border-b border-zinc-100">
							<Text size="small" className="w-[28%] text-foreground">
								0
							</Text>
							<Text size="small" className="w-[26%] text-foreground">
								1
							</Text>
							<Text size="small" className="flex-1 text-foreground">
								Transaksi berhasil (Sisa stock: -1)
							</Text>
						</View>

						<View className="flex-row py-2.5 px-2">
							<Text size="small" className="w-[28%] text-foreground">
								-3
							</Text>
							<Text size="small" className="w-[26%] text-foreground">
								2
							</Text>
							<Text size="small" className="flex-1 text-foreground">
								Transaksi berhasil (Sisa stock: -5)
							</Text>
						</View>
					</View>
				</View>

				{/* Note Card */}
				<View className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
					<View className="flex-row items-center gap-2">
						<Feather name="info" size={16} color={Colors.primary} />
						<Text w="bold" size="normal" className="text-primary">
							Catatan
						</Text>
					</View>
					<Text size="small" className="mt-1.5 leading-relaxed text-foreground/80">
						Pengaturan ini hanya memengaruhi produk yang tidak dikecualikan
						pada bagian Penerapan.
					</Text>
				</View>
			</View>
		</Wrapper>
	);
}
