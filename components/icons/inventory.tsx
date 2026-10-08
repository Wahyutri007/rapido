import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const InventoryIcon = createIcon({
	name: "InventoryIcon",
	viewBox: "0 0 24 24",
	path: (
		<Path
			d="M5 22c-.55 0-1.02-.196-1.412-.587A1.93 1.93 0 013 20V8.725c-.3-.183-.542-.42-.725-.712A1.862 1.862 0 012 7V4c0-.55.196-1.02.588-1.412A1.93 1.93 0 014 2h16c.55 0 1.021.196 1.413.588.392.392.588.863.587 1.412v3c0 .383-.092.721-.275 1.013a2.175 2.175 0 01-.725.711V20c0 .55-.196 1.021-.587 1.413A1.92 1.92 0 0119 22H5zM5 9v11h14V9H5zM4 7h16V4H4v3zm5 7h6v-2H9v2z"
			fill="currentColor"
		/>
	),
});

export const Inventory = InventoryIcon;
export default InventoryIcon;
