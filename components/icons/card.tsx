import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const CardIcon = createIcon({
	name: "CardIcon",
	viewBox: "0 0 20 20",
	path: (
		<Path
			d="M2.5 8.333v5.833c0 .921.746 1.667 1.667 1.667h11.666c.92 0 1.667-.746 1.667-1.667V8.333m-15 0v-2.5c0-.92.746-1.667 1.667-1.667h11.666c.92 0 1.667.746 1.667 1.667v2.5m-15 0h15M5.833 11.666h2.5"
			stroke="currentColor"
			strokeWidth={1.25}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default CardIcon;
