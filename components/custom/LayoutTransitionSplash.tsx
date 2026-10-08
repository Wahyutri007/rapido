import React, { useEffect, useState } from "react";
import { SplashScreenView } from "@/components/custom/SplashScreenView";
import { APP_MODE_LABELS, useAppModeStore } from "@/store/appModeStore";

export function LayoutTransitionSplash() {
	const isTransitioning = useAppModeStore((state) => state.isTransitioning);
	const mode = useAppModeStore((state) => state.mode);
	const [isVisible, setIsVisible] = useState(isTransitioning);

	useEffect(() => {
		if (isTransitioning) {
			setIsVisible(true);
		}
	}, [isTransitioning]);

	if (!isVisible) {
		return null;
	}

	return (
		<SplashScreenView
			mode="transition"
			targetModeLabel={APP_MODE_LABELS[mode]}
			isReady={!isTransitioning}
			onAnimationComplete={() => {
				setIsVisible(false);
			}}
		/>
	);
}

