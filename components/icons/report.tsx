import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const ReportIcon = createIcon({
	name: "ReportIcon",
	viewBox: "0 0 24 24",
	path: (
		<Path
			d="M16 21.5l-.857-3M8 21.5l.857-3M8 13v1m4-6v6m4-3v3m5-8v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2z"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export const Report = ReportIcon;
export default ReportIcon;
