import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const ManagerIcon = createIcon({
	name: "ManagerIcon",
	viewBox: "0 0 24 24",
	path: (
		<Path
			d="M6.75 7a5 5 0 1010 0 5 5 0 00-10 0zm3.691 7.82l.727 1.211-1.3 4.84-1.407-5.738c-.078-.317-.383-.524-.7-.442A6.3 6.3 0 003 20.801C3 21.465 3.54 22 4.2 22h15.1a1.2 1.2 0 001.2-1.2 6.3 6.3 0 00-4.762-6.109.584.584 0 00-.699.442l-1.406 5.738-1.301-4.84.727-1.21a.624.624 0 00-.536-.946H10.98a.625.625 0 00-.535.945h-.004z"
			fill="currentColor"
		/>
	),
});

export const Manager = ManagerIcon;
export default ManagerIcon;
