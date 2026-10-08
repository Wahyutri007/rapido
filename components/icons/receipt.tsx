import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const ReceiptIcon = createIcon({
	name: "ReceiptIcon",
	viewBox: "0 0 24 24",
	path: (
		<Path
			d="M9 8h6m-6 4h2m8 9V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l2.333-2 2.334 2L12 19l2.333 2 2.334-2L19 21z"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default ReceiptIcon;
