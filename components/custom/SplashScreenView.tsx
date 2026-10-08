import React, { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { FONT_NAMES } from "@/constants/Fonts";
import { haptic } from "@/lib/haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface SplashScreenViewProps {
	/**
	 * "boot" = Initial cold-start / app boot screen in app/index.tsx
	 * "transition" = Mode switch transition overlay (Back Office, Kasir, etc.)
	 */
	mode?: "boot" | "transition";

	/**
	 * Subtitle or target mode name for transition (e.g. "Kasir", "Back Office")
	 */
	targetModeLabel?: string;

	/**
	 * Controls exit animation. When `isReady` turns true, triggers the scale-up & fade-out outro.
	 */
	isReady?: boolean;

	/**
	 * Callback fired when outro animation finishes, signaling safe navigation.
	 */
	onAnimationComplete?: () => void;

	/**
	 * Optional tap handler (e.g. for dev preview to trigger early exit)
	 */
	onPress?: () => void;
}

export function SplashScreenView({
	mode = "boot",
	targetModeLabel,
	isReady = false,
	onAnimationComplete,
	onPress,
}: SplashScreenViewProps) {
	// Root container animation values
	const containerOpacity = useSharedValue(mode === "transition" ? 0 : 1);
	const containerScale = useSharedValue(1);

	// Ambient rings animation
	const ringScale = useSharedValue(0.94);
	const ringOpacity = useSharedValue(0.6);

	// Wordmark entrance values
	const logoScale = useSharedValue(0.82);
	const logoTranslateY = useSharedValue(24);
	const logoOpacity = useSharedValue(0);

	// Subtitle / badge entrance
	const detailsOpacity = useSharedValue(0);
	const detailsTranslateY = useSharedValue(12);

	// Delayed slow-connection status indicator (appears if boot > 1.2s)
	const statusOpacity = useSharedValue(0);

	// Entrance animation trigger
	useEffect(() => {
		// If mode === "transition", fade in root container rapidly
		if (mode === "transition") {
			containerOpacity.value = withTiming(1, {
				duration: 250,
				easing: Easing.out(Easing.ease),
			});
		}

		// 1. Ambient pulsing background rings
		ringScale.value = withRepeat(
			withTiming(1.08, {
				duration: 2800,
				easing: Easing.inOut(Easing.ease),
			}),
			-1,
			true,
		);
		ringOpacity.value = withRepeat(
			withTiming(1, {
				duration: 2800,
				easing: Easing.inOut(Easing.ease),
			}),
			-1,
			true,
		);

		// 2. Logo Wordmark spring entrance
		logoScale.value = withSpring(1, {
			damping: 14,
			stiffness: 130,
			mass: 0.9,
		});
		logoTranslateY.value = withSpring(0, {
			damping: 14,
			stiffness: 130,
			mass: 0.9,
		});
		logoOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.cubic),
		});

		// 3. Mode badge fade in (for mode transitions)
		if (mode === "transition") {
			detailsOpacity.value = withDelay(
				250,
				withTiming(1, {
					duration: 400,
					easing: Easing.out(Easing.ease),
				}),
			);
			detailsTranslateY.value = withDelay(
				250,
				withSpring(0, {
					damping: 15,
					stiffness: 120,
				}),
			);
		}

		// 4. Slow network helper for boot mode (after 1.2s if still loading)
		if (mode === "boot") {
			statusOpacity.value = withDelay(
				1200,
				withTiming(1, {
					duration: 400,
					easing: Easing.out(Easing.ease),
				}),
			);
		}
	}, [
		mode,
		containerOpacity,
		ringScale,
		ringOpacity,
		logoScale,
		logoTranslateY,
		logoOpacity,
		detailsOpacity,
		detailsTranslateY,
		statusOpacity,
	]);

	// Outro / Exit animation trigger
	useEffect(() => {
		if (isReady) {
			haptic.light();

			// Zoom logo and container smoothly
			containerScale.value = withTiming(1.08, {
				duration: 320,
				easing: Easing.out(Easing.cubic),
			});

			// Fade out container
			containerOpacity.value = withTiming(
				0,
				{
					duration: 320,
					easing: Easing.in(Easing.ease),
				},
				(finished) => {
					if (finished && onAnimationComplete) {
						runOnJS(onAnimationComplete)();
					}
				},
			);
		}
	}, [isReady, onAnimationComplete, containerScale, containerOpacity]);

	// Animated Styles
	const containerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: containerOpacity.value,
		transform: [{ scale: containerScale.value }],
		pointerEvents: containerOpacity.value > 0.05 ? "auto" : "none",
	}));

	const ambientRing1Style = useAnimatedStyle(() => ({
		transform: [{ scale: ringScale.value }],
		opacity: ringOpacity.value * 0.45,
	}));

	const ambientRing2Style = useAnimatedStyle(() => ({
		transform: [{ scale: ringScale.value * 1.18 }],
		opacity: ringOpacity.value * 0.25,
	}));

	const logoAnimatedStyle = useAnimatedStyle(() => ({
		opacity: logoOpacity.value,
		transform: [
			{ scale: logoScale.value },
			{ translateY: logoTranslateY.value },
		],
	}));

	const detailsAnimatedStyle = useAnimatedStyle(() => ({
		opacity: detailsOpacity.value,
		transform: [{ translateY: detailsTranslateY.value }],
	}));

	const statusAnimatedStyle = useAnimatedStyle(() => ({
		opacity: statusOpacity.value,
	}));

	return (
		<Animated.View
			style={[
				StyleSheet.absoluteFillObject,
				styles.container,
				containerAnimatedStyle,
			]}
		>
			<LinearGradient
				colors={["#1d4ed8", "#2563eb", "#3b82f6"]}
				start={{ x: 0.1, y: 0 }}
				end={{ x: 0.9, y: 1 }}
				style={StyleSheet.absoluteFillObject}
			/>

			{onPress && (
				<Pressable
					onPress={onPress}
					style={StyleSheet.absoluteFillObject}
					accessibilityRole="button"
					accessibilityLabel="Tutup splash screen"
				/>
			)}

			{/* Concentric Ambient Glow Rings */}
			<Animated.View style={[styles.ambientRing, styles.ringOuter, ambientRing2Style]} />
			<Animated.View style={[styles.ambientRing, styles.ringInner, ambientRing1Style]} />

			{/* Center Brand Identity */}
			<View className="items-center justify-center">
				<Animated.View
					style={[styles.logoContainer, logoAnimatedStyle]}
				>
					<Animated.Text
						style={styles.logoText}
						accessibilityRole="header"
					>
						Kasikoo
					</Animated.Text>
				</Animated.View>

				{/* Mode-Switch Badge (for mode transitions only) */}
				{mode === "transition" && (
					<Animated.View style={[styles.detailsContainer, detailsAnimatedStyle]}>
						<View style={styles.transitionBadge}>
							<View style={styles.activeDot} />
							<Animated.Text style={styles.transitionBadgeText}>
								{targetModeLabel ? `Beralih ke ${targetModeLabel}...` : "Memuat mode..."}
							</Animated.Text>
						</View>
					</Animated.View>
				)}
			</View>

			{/* Slow network connection feedback in boot mode */}
			{mode === "boot" && (
				<Animated.View style={[styles.statusContainer, statusAnimatedStyle]}>
					<View style={styles.statusPill}>
						<Animated.Text style={styles.statusText}>
							Menghubungkan ke server...
						</Animated.Text>
					</View>
				</Animated.View>
			)}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		alignItems: "center",
		zIndex: 99999,
		backgroundColor: "#1d4ed8",
	},
	ambientRing: {
		position: "absolute",
		borderRadius: 9999,
		borderWidth: 1.5,
		borderColor: "rgba(255, 255, 255, 0.16)",
		backgroundColor: "rgba(255, 255, 255, 0.03)",
	},
	ringInner: {
		width: Math.min(SCREEN_WIDTH * 0.72, 300),
		height: Math.min(SCREEN_WIDTH * 0.72, 300),
	},
	ringOuter: {
		width: Math.min(SCREEN_WIDTH * 1.05, 440),
		height: Math.min(SCREEN_WIDTH * 1.05, 440),
	},
	logoContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		paddingVertical: 8,
	},
	logoText: {
		fontFamily: FONT_NAMES.logo,
		fontSize: 56,
		color: "#ffffff",
		letterSpacing: -0.5,
		textAlign: "center",
	},
	detailsContainer: {
		marginTop: 18,
		alignItems: "center",
	},
	transitionBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.16)",
		paddingHorizontal: 16,
		paddingVertical: 7,
		borderRadius: 9999,
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.28)",
	},
	activeDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "#67e8f9",
		marginRight: 8,
	},
	transitionBadgeText: {
		fontFamily: FONT_NAMES.medium,
		fontSize: 14,
		color: "#ffffff",
	},
	statusContainer: {
		position: "absolute",
		bottom: 48,
		alignSelf: "center",
	},
	statusPill: {
		backgroundColor: "rgba(0, 0, 0, 0.22)",
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 9999,
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.14)",
	},
	statusText: {
		fontFamily: FONT_NAMES.regular,
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.85)",
	},
});
