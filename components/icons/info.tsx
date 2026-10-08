import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const InfoIcon = createIcon({
	name: "InfoIcon",
	viewBox: "0 0 13 13",
	path: (
		<Path
			d="M7 8.5h-.5v-2H6m.5-2h.005M11 6.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default InfoIcon;
