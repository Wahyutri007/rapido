import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const ArrowCircleRightIcon = createIcon({
	name: "ArrowCircleRightIcon",
	viewBox: "0 0 24 24",
	path: (
		<Path
			d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default ArrowCircleRightIcon;
