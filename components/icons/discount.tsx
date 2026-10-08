import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const DiscountIcon = createIcon({
	name: "DiscountIcon",
	viewBox: "0 0 20 20",
	path: (
		<>
			<Path
				d="M15.834 4.167c0-.92-.746-1.667-1.667-1.667H5.834c-.92 0-1.667.746-1.667 1.667V17.5l1.944-1.667L8.056 17.5 10 15.833l1.945 1.667 1.944-1.667 1.945 1.667V4.167zM12.709 6.458l-5.417 5.417"
				stroke="currentColor"
				strokeWidth={1.25}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M7.5 6.667h.009m.2 0a.208.208 0 11-.417 0 .208.208 0 01.417 0zM12.5 11.667h.009m.2 0a.208.208 0 11-.417 0 .208.208 0 01.417 0z"
				stroke="currentColor"
				strokeWidth={1.25}
				strokeLinecap="round"
			/>
		</>
	),
});

export default DiscountIcon;
