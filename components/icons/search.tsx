import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const SearchIcon = createIcon({
	name: "SearchIcon",
	viewBox: "0 0 24 24",
	path: (
		<Path
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default SearchIcon;
