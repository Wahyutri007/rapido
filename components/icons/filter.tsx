import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const FilterIcon = createIcon({
	name: "FilterIcon",
	viewBox: "0 0 26 26",
	path: (
		<Path
			d="M6.5 13H4.333M6.5 13a2.167 2.167 0 004.333 0M6.5 13a2.167 2.167 0 014.333 0m8.667 6.5a2.167 2.167 0 00-4.334 0m4.334 0a2.167 2.167 0 01-4.334 0m4.334 0h2.166m-6.5 0H4.333m6.5-6.5h10.833M19.5 6.5a2.167 2.167 0 00-4.334 0m4.334 0a2.167 2.167 0 01-4.334 0m4.334 0h2.166m-6.5 0H4.333"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default FilterIcon;
