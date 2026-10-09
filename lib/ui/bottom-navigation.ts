export type TabAppearance = "default" | "figma" | "cashier";

/** Keep the icon, label and system inset inside the custom tab bar. */
export function bottomTabLayout(
	appearance: TabAppearance,
	bottomInset: number,
	fontScale = 1,
) {
	const isFigma = appearance !== "default";
	const paddingBottom = Math.max(bottomInset, isFigma ? 32 : 16);
	const paddingTop = isFigma ? 16 : 24;
	const labelHeight = Math.ceil(16 * Math.max(1, fontScale));
	const contentHeight = isFigma
		? 24 + 8 + labelHeight
		: 28 + 4 + labelHeight + 8;
	return {
		paddingBottom,
		paddingTop,
		height: paddingTop + contentHeight + paddingBottom,
	};
}

/** Screens shared between modes reserve enough space for either tab style. */
export function bottomTabClearance(bottomInset: number, fontScale = 1) {
	return Math.max(
		bottomTabLayout("default", bottomInset, fontScale).height,
		bottomTabLayout("cashier", bottomInset, fontScale).height,
	);
}
