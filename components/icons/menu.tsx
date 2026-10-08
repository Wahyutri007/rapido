import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const MenuIcon = createIcon({
	name: "MenuIcon",
	viewBox: "0 0 24 24",
	path: (
		<>
			<Path
				d="M11 5H5a2 2 0 00-2 2v10a2 2 0 002 2h6m0-14h8a2 2 0 012 2v10a2 2 0 01-2 2h-8m0-14v14"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="square"
				strokeLinejoin="round"
			/>
			<Path
				d="M7 14.375a.875.875 0 11-.875.875l.005-.09a.875.875 0 01.87-.785zm0-3.25a.875.875 0 11-.875.875l.005-.09a.875.875 0 01.87-.785zm.09-3.245a.875.875 0 11-.965.87l.005-.09A.875.875 0 017 7.875l.09.005z"
				fill="currentColor"
				stroke="currentColor"
				strokeWidth={0.75}
			/>
		</>
	),
});

export default MenuIcon;
