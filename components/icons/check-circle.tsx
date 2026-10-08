import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const CheckCircleIcon = createIcon({
	name: "CheckCircleIcon",
	viewBox: "0 0 13 13",
	path: (
		<Path
			d="M5 6.5l1 1 2-2m3 1a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default CheckCircleIcon;
