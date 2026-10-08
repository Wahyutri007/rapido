import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const AddIcon = createIcon({
	name: "AddIcon",
	viewBox: "0 0 24 24",
	path: (
		<>
			<Path
				d="M13.414 3.414a2 2 0 00-2.829 0l-7.171 7.172a2 2 0 000 2.828l7.171 7.172a2 2 0 002.829 0l7.171-7.172a2 2 0 000-2.828l-7.171-7.172z"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinejoin="round"
			/>
			<Path
				d="M12 9v6m-3-3h6"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</>
	),
});

export default AddIcon;
