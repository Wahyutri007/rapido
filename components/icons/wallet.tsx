import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const WalletIcon = createIcon({
	name: "WalletIcon",
	viewBox: "0 0 16 16",
	path: (
		<>
			<Path
				d="M12.667 4.667v-2A.667.667 0 0012 2H3.333a1.333 1.333 0 000 2.667h10a.667.667 0 01.667.666V8m0 0h-2a1.333 1.333 0 100 2.667h2a.667.667 0 00.667-.667V8.667A.667.667 0 0014 8z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M2 3.332v9.333A1.333 1.333 0 003.333 14h10a.666.666 0 00.667-.667v-2.667"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</>
	),
});

export default WalletIcon;
