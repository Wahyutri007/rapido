import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const DownTrendIcon = createIcon({
	name: "DownTrendIcon",
	viewBox: "0 0 16 16",
	path: (
		<Path
			d="M2.66406 3V12.6667C2.66406 12.8435 2.7343 13.013 2.85932 13.1381C2.98435 13.2631 3.15392 13.3333 3.33073 13.3333H13.3307M4.66406 6.66667L7.33073 9.33333L9.9974 6.66667L13.3307 10M13.3307 7.862V10H11.1927"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default DownTrendIcon;
