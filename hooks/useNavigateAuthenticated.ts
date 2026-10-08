import { type Href, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useAppModeStore } from "@/store/appModeStore";
import { useActiveStore } from "@/store/useActiveStore";

export function useNavigateAuthenticated() {
	const router = useRouter();
	const auth = useAuth();
	const mode = useAppModeStore((state) => state.mode);
	const { activeStoreId, setActiveStoreId } = useActiveStore();

	return function navigateAuthenticated() {
		const isOwner = auth.user?.roles.includes("owner");
		const teamId = auth.user?.user.team_id;

		// Back Office & Absence modes — no store context needed upfront
		if (mode === "back-office") {
			router.replace("/(back-office)/home");
			return;
		}

		if (mode === "absence") {
			router.replace("/(absence)/home");
			return;
		}

		const storeScopedRoutes: Record<string, Href> = {
			cashier: "/(cashier)/home",
			operator: "/(operator)/home",
		};
		const targetRoute = storeScopedRoutes[mode];

		// Unknown mode — fallback to back-office
		if (!targetRoute) {
			router.replace("/(back-office)/home");
			return;
		}

		if (isOwner) {
			if (activeStoreId) {
				router.replace(targetRoute);
			} else {
				// Owner has no store selected (e.g. storage cleared)
				useAppModeStore.getState().setMode("back-office");
				router.replace("/(back-office)/home");
			}
		} else {
			if (teamId) {
				// Worker: sync active store with their assigned team
				setActiveStoreId(teamId);
				router.replace(targetRoute);
			} else {
				// Worker has no assigned store — fallback to back-office
				useAppModeStore.getState().setMode("back-office");
				router.replace("/(back-office)/home");
			}
		}
	};
}
