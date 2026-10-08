import * as Haptics from "expo-haptics";

/**
 * Haptic feedback utility tailored for Android devices and POS terminals.
 */
export const haptic = {
	light: () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
	},
	medium: () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
	},
	heavy: () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
	},
	selection: () => {
		Haptics.selectionAsync().catch(() => {});
	},
	success: () => {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
			() => {},
		);
	},
	warning: () => {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
			() => {},
		);
	},
	error: () => {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
			() => {},
		);
	},
};
