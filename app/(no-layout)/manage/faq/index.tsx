import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import FaqCard from "@/components/feature/support/FaqCard";
import { EFeather } from "@/components/icons";
import { Button, ButtonText } from "@/components/ui/button";
import { FAQ_CATEGORIES, FAQ_ENTRIES } from "@/constants/data/support";
import { cn } from "@/lib/utils";
import type { FaqCategory } from "@/types/ui/support";

export default function FaqScreen() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<FaqCategory | "all">("all");
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const supportModal = useAlertModal();
	const query = search.trim().toLocaleLowerCase("id");
	const filteredEntries = FAQ_ENTRIES.filter(
		(entry) =>
			(category === "all" || entry.categories.includes(category)) &&
			(!query ||
				`${entry.question} ${entry.answer}`
					.toLocaleLowerCase("id")
					.includes(query)),
	);

	return (
		<>
			<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
				<SearchBar
					search={search}
					setSearch={setSearch}
					placeholder="Cari..."
					variant="light"
				/>
				<ScrollView
					horizontal
					style={{ flexGrow: 0, flexShrink: 0 }}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: 8 }}
				>
					{FAQ_CATEGORIES.map((item) => (
						<Pressable
							key={item.value}
							className={cn(
								"items-center justify-center rounded-lg border border-primary px-4 py-3",
								category === item.value && "bg-primary",
							)}
							accessibilityRole="tab"
							accessibilityState={{ selected: category === item.value }}
							onPress={() => {
								setCategory(item.value);
								setExpandedId(null);
							}}
						>
							<Text
								size="normal"
								w="medium"
								className={
									category === item.value ? "text-inverse" : "text-primary"
								}
							>
								{item.label}
							</Text>
						</Pressable>
					))}
				</ScrollView>
				<View className="gap-4">
					{filteredEntries.map((entry) => (
						<FaqCard
							key={entry.id}
							entry={entry}
							expanded={entry.id === expandedId}
							onToggle={() =>
								setExpandedId(entry.id === expandedId ? null : entry.id)
							}
						/>
					))}
					{!filteredEntries.length && (
						<SearchNotFound text="Pertanyaan tidak ditemukan" />
					)}
				</View>
				<View className="flex-row items-start gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4">
					<EFeather name="headphones" size={24} className="text-primary" />
					<View className="flex-1 items-start gap-2">
						<Text size="small" w="semibold">
							Masih butuh bantuan?
						</Text>
						<Text size="small" className="leading-4 text-muted">
							Tim support kami siap membantu Anda melalui live chat atau email
							kapan saja.
						</Text>
						<Button size="xs" onPress={supportModal.open}>
							<ButtonText size="xs">Hubungi Support</ButtonText>
						</Button>
					</View>
				</View>
			</Wrapper>
			<AlertModal
				openState={supportModal.openState}
				title="Kontak support belum tersedia"
				message="Alamat email dan live chat support belum tersedia. Silakan hubungi pengelola toko untuk bantuan sementara."
				hideCancelButton
				confirmText="Tutup"
			/>
		</>
	);
}
