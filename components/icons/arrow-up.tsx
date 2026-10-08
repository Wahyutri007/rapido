import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const ArrowUpIcon = createIcon({
	name: "ArrowUpIcon",
	viewBox: "0 0 16 16",
	path: (
		<Path
			d="M8 13.3327V2.66602M4 6.66602L8 2.66602L12 6.66602"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default ArrowUpIcon;
