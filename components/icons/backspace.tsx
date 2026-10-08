import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const BackspaceIcon = createIcon({
	name: "BackspaceIcon",
	viewBox: "0 0 32 32",
	path: (
		<Path
			d="M28 25H10.586l-9-9 9-9H28v18zM4.414 16l7 7H26V9H11.414l-7 7zm18-3l-3 3 3 3L21 20.414l-3-3-3 3L13.586 19l3-3-3-3L15 11.586l3 3 3-3L22.414 13z"
			fill="currentColor"
		/>
	),
});

export default BackspaceIcon;
