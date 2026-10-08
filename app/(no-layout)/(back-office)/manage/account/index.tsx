import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import CardList, {
	CardListItem,
	CardListTitle,
} from "@/components/custom/CardList";
import { Colors } from "@/constants/Colors";

function OwnerInfoCard() {
	return (
		<CardList>
			<CardListTitle
				title="Informasi Pemilik"
				action={
					<Pressable
						className="size-8 items-center justify-center rounded-lg active:opacity-60"
						onPress={() => router.push("/manage/account/modify-owner")}
					>
						<Feather name="edit" size={18} color={Colors.primary} />
					</Pressable>
				}
			/>
			<CardListItem label="Nama Pemilik" value="Arianja" />
			<CardListItem label="Email" value="Arianja8601@gmail.com" />
			<CardListItem label="No.HP" value="+628129483746" />
			<CardListItem label="Alamat" value="Pulai Kumpai,Pangean" />
			<CardListItem label="ID Card" value="10033" />
		</CardList>
	);
}

function BusinessInfoCard() {
	return (
		<CardList>
			<CardListTitle
				title="Informasi Bisnis"
				action={
					<Pressable
						className="size-8 items-center justify-center rounded-lg active:opacity-60"
						onPress={() => router.push("/manage/account/modify-business")}
					>
						<Feather name="edit" size={18} color={Colors.primary} />
					</Pressable>
				}
			/>
			<CardListItem label="Nama Merchant" value="Sushiro" />
			<CardListItem label="Alamat Merchant" value="Jl. Oasis" />
			<CardListItem label="Provinsi" value="Riau" />
			<CardListItem label="Kota" value="Pekanbaru" />
			<CardListItem label="Kecamatan" value="Tampan" />
			<CardListItem label="Kode Pos" value="28282" />
		</CardList>
	);
}

export default function ManageAccountScreen() {
	return (
		<AnimatedWrapper contentContainerStyle={{ padding: 16 }} showScrollToTopFab>
			<View className="gap-4">
				<OwnerInfoCard />
				<BusinessInfoCard />
			</View>
		</AnimatedWrapper>
	);
}
