import { type Href, useRouter } from "expo-router";
import * as SecureStore from "@/lib/storage";
import React from "react";
import { useApiHealthData } from "@/api/hooks/misc";
import { SplashScreenView } from "@/components/custom/SplashScreenView";
import Keys from "@/constants/Keys";
import { useAuth } from "@/context/AuthContext";
import { useNavigateAuthenticated } from "@/hooks/useNavigateAuthenticated";

const DEV_ROUTE: Href | null = null;
const MIN_SPLASH_DURATION_MS = 850;

export default function IndexScreen() {
	const router = useRouter();
	const apiHealthQuery = useApiHealthData();
	const auth = useAuth();
	const navigateAuthenticated = useNavigateAuthenticated();
	const [isRevalidatingAuth, setIsRevalidatingAuth] = React.useState(false);

	const [minTimePassed, setMinTimePassed] = React.useState(false);
	const [pendingTarget, setPendingTarget] = React.useState<string | null>(
		null,
	);
	const [isReady, setIsReady] = React.useState(false);

	// Enforce minimum splash display duration so animations can play gracefully
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setMinTimePassed(true);
		}, MIN_SPLASH_DURATION_MS);

		return () => clearTimeout(timer);
	}, []);

	// Determine destination route based on server health and auth status
	React.useEffect(() => {
		if (apiHealthQuery.status === "pending") return;

		if (
			apiHealthQuery.status === "error" ||
			apiHealthQuery.data.status !== "online"
		) {
			setPendingTarget("/maintenance");
			return;
		}

		if (auth.isLoading || isRevalidatingAuth) return;

		if (DEV_ROUTE) {
			setPendingTarget(DEV_ROUTE as string);
			return;
		}

		if (auth.authenticated) {
			setPendingTarget("__AUTH__");
			return;
		}

		// If not yet authenticated in state, check if there is an auth token in storage that can be revalidated
		const storedToken = SecureStore.getItem(Keys.AUTH_TOKEN);
		if (storedToken && !auth.user) {
			setIsRevalidatingAuth(true);
			auth.reloadAuth().then((isAuthenticated) => {
				setIsRevalidatingAuth(false);
				if (isAuthenticated) {
					setPendingTarget("__AUTH__");
				} else {
					const onboardingFinished = !!SecureStore.getItem(
						Keys.ONBOARDING_COMPLETED,
					);
					setPendingTarget(
						onboardingFinished
							? "/(onboarding)/start"
							: "/(onboarding)/onboarding",
					);
				}
			});
			return;
		}

		const onboardingFinished = !!SecureStore.getItem(Keys.ONBOARDING_COMPLETED);
		setPendingTarget(
			onboardingFinished ? "/(onboarding)/start" : "/(onboarding)/onboarding",
		);
	}, [
		apiHealthQuery.status,
		apiHealthQuery.data?.status,
		auth.isLoading,
		auth.authenticated,
		auth.user,
		isRevalidatingAuth,
	]);

	// Trigger exit animation when both destination is resolved and minimum duration has elapsed
	React.useEffect(() => {
		if (minTimePassed && pendingTarget && !isReady) {
			setIsReady(true);
		}
	}, [minTimePassed, pendingTarget, isReady]);

	// Complete navigation once the outro animation finishes
	const handleAnimationComplete = React.useCallback(() => {
		if (!pendingTarget) return;

		if (pendingTarget === "__AUTH__") {
			navigateAuthenticated();
		} else {
			router.replace(pendingTarget as any);
		}
	}, [pendingTarget, navigateAuthenticated, router]);

	return (
		<SplashScreenView
			mode="boot"
			isReady={isReady}
			onAnimationComplete={handleAnimationComplete}
		/>
	);
}

