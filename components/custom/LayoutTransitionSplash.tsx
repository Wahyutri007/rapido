import React from "react";
import { SplashScreenView } from "@/components/custom/SplashScreenView";
import { APP_MODE_LABELS, useAppModeStore } from "@/store/appModeStore";

export function LayoutTransitionSplash() {
	const isTransitioning = useAppModeStore((state) => state.isTransitioning);
	const mode = useAppModeStore((state) => state.mode);
	const [transition, setTransition] = React.useState({
		active: isTransitioning,
		visible: isTransitioning,
		id: 0,
	});

	if (transition.active !== isTransitioning) {
		setTransition({
			active: isTransitioning,
			visible: isTransitioning || transition.visible,
			id: transition.id + (isTransitioning ? 1 : 0),
		});
	}

	const handleAnimationComplete = React.useCallback(() => {
		setTransition((current) => {
			// An earlier outro may finish after another mode transition starts.
			if (current.id !== transition.id || current.active || !current.visible) {
				return current;
			}
			return { ...current, visible: false };
		});
	}, [transition.id]);

	if (!transition.visible) {
		return null;
	}

	return (
		<SplashScreenView
			key={transition.id}
			mode="transition"
			targetModeLabel={APP_MODE_LABELS[mode]}
			isReady={!isTransitioning}
			onAnimationComplete={handleAnimationComplete}
		/>
	);
}
