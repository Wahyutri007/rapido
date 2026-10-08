/**
 * Convert a hex color (e.g. "#6d96ff" or "#6df") to an rgba() string with
 * the given opacity (0..1). Useful for shadows/glows/overlays that need a
 * color derived from a theme token.
 */
export function hexToRgba(hex: string, alpha: number): string {
	const normalized = hex.replace("#", "");
	const full =
		normalized.length === 3
			? normalized
					.split("")
					.map((c) => c + c)
					.join("")
			: normalized;

	const int = Number.parseInt(full, 16);
	if (Number.isNaN(int) || full.length !== 6) {
		throw new Error(`Invalid hex color: "${hex}"`);
	}

	const r = (int >> 16) & 255;
	const g = (int >> 8) & 255;
	const b = int & 255;
	const clampedAlpha = Math.min(1, Math.max(0, alpha));

	return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}
