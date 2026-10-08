import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const TableIcon = createIcon({
	name: "TableIcon",
	viewBox: "0 0 20 20",
	path: (
		<Path
			d="M5.997 16.666l1.25-3.125A1.63 1.63 0 018.79 12.5h1.375V9.147c-2.125-.07-3.906-.382-5.344-.938C3.382 7.652 2.664 7 2.664 6.25c0-.806.813-1.493 2.438-2.063 1.625-.57 3.59-.854 5.895-.854 2.32 0 4.289.285 5.907.854 1.618.57 2.427 1.257 2.427 2.063 0 .75-.72 1.402-2.157 1.958-1.438.556-3.219.868-5.343.938V12.5h1.375c.333 0 .642.094.927.281.285.188.49.441.614.76l1.25 3.125h-1.666l-1-2.5H8.664l-1 2.5H5.997z"
			fill="currentColor"
		/>
	),
});

export const Table = TableIcon;
export default TableIcon;
