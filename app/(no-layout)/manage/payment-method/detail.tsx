import { useLocalSearchParams } from "expo-router";
import PaymentMethodDetailScreen from "@/components/feature/manage/settings/PaymentMethodDetailScreen";

export default function PaymentMethodDetailRoute() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	return <PaymentMethodDetailScreen id={id} />;
}
