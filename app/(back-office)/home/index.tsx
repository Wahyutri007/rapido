import Wrapper from "@/components/common/Wrapper";
import DailySalesGraph from "@/components/feature/home/DailySalesGraph";
import Filters from "@/components/feature/home/Filters";
import Header from "@/components/feature/home/Header";
import ReportSummary from "@/components/feature/home/ReportSummary";
import { tw } from "@/lib/utils";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";

export default function HomeScreen() {
	return (
		<Wrapper hasBottomBar pb={tw(4)}>
			<StatusBar style="light" />
			<Header />
			<View className="px-4 mt-2">
				<Filters />
			</View>
			<View className="px-4 mt-4">
				<ReportSummary title="Ringkasan Laporan" />
			</View>
			<View className="px-4 mt-4">
				<DailySalesGraph title="Total Penjualan Harian" />
			</View>
		</Wrapper>
	);
}
