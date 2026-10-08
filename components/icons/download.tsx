import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const DownloadIcon = createIcon({
	name: "DownloadIcon",
	viewBox: "0 0 16 16",
	path: (
		<Path
			d="M14 10v2.667A1.334 1.334 0 0112.667 14H3.333A1.334 1.334 0 012 12.667V10M4.664 6.666l3.333 3.333 3.334-3.333M8 10V2"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default DownloadIcon;
