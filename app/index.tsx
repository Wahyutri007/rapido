import { type Href, useRouter } from "expo-router";
import React from "react";
import { useApiHealthData } from "@/api/hooks/misc";
import { SplashScreenView } from "@/components/custom/SplashScreenView";
import Keys from "@/constants/Keys";
import { useAuth } from "@/context/AuthContext";
import { useNavigateAuthenticated } from "@/hooks/useNavigateAuthenticated";
import * as SecureStore from "@/lib/storage";

const DEV_ROUTE: Href | null = null;
const MIN_SPLASH_DURATION_MS = 850;

// Boot already rerenders for query/auth/timer changes; recheck storage then.
const subscribeToOnboardingCompletion = () => () => {};
function getOnboardingCompleted() {
	try {
		return !!SecureStore.getItem(Keys.ONBOARDING_COMPLETED);
	} catch {
		return false;
	}
}

export default function IndexScreen() {
	const router = useRouter();
	const apiHealthQuery = useApiHealthData();
	const auth = useAuth();
	const navigateAuthenticated = useNavigateAuthenticated();
	const [minTimePassed, setMinTimePassed] = React.useState(false);
	const onboardingFinished = React.useSyncExternalStore(
		subscribeToOnboardingCompletion,
		getOnboardingCompleted,
		() => false,
	);

	// Enforce minimum splash display duration so animations can play gracefully
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setMinTimePassed(true);
		}, MIN_SPLASH_DURATION_MS);

		return () => clearTimeout(timer);
	}, []);

	// AuthProvider owns stored-token validation and exposes the final auth state.
	let pendingTarget: string | null = null;
	if (
		apiHealthQuery.status === "error" ||
		(apiHealthQuery.status === "success" &&
			apiHealthQuery.data?.status !== "online")
	) {
		pendingTarget = "/maintenance";
	} else if (apiHealthQuery.status === "success" && !auth.isLoading) {
		pendingTarget = DEV_ROUTE
			? (DEV_ROUTE as string)
			: auth.authenticated
				? "__AUTH__"
				: onboardingFinished
					? "/(onboarding)/start"
					: "/(onboarding)/onboarding";
	}
	const isReady = minTimePassed && pendingTarget !== null;
	const [splashSession, setSplashSession] = React.useState({
		ready: isReady,
		id: 0,
	});
	if (splashSession.ready !== isReady) {
		setSplashSession({
			ready: isReady,
			id: splashSession.id + (isReady ? 0 : 1),
		});
	}
	const completion = React.useRef<{
		id: number;
		navigate: () => void;
	} | null>(null);
	const navigationCompleted = React.useRef(false);

	// A late animation must use the latest committed decision and run only once.
	React.useEffect(() => {
		completion.current =
			isReady && pendingTarget && !navigationCompleted.current
				? {
						id: splashSession.id,
						navigate: () => {
							if (pendingTarget === "__AUTH__") navigateAuthenticated();
							else router.replace(pendingTarget as Href);
						},
					}
				: null;
		return () => {
			completion.current = null;
		};
	}, [isReady, pendingTarget, navigateAuthenticated, router, splashSession.id]);

	const handleAnimationComplete = React.useCallback(() => {
		const current = completion.current;
		if (
			!current ||
			current.id !== splashSession.id ||
			navigationCompleted.current
		) {
			return;
		}
		navigationCompleted.current = true;
		completion.current = null;
		current.navigate();
	}, [splashSession.id]);

	return (
		<SplashScreenView
			key={splashSession.id}
			mode="boot"
			isReady={isReady}
			onAnimationComplete={handleAnimationComplete}
		/>
	);
}
