import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const AIIcon = createIcon({
	name: "AIIcon",
	viewBox: "0 0 20 20",
	path: (
		<Path
			d="M15.167 2.5c-.57 2.06-1.304 2.764-3.334 3.333 2.03.57 2.764 1.274 3.334 3.334.57-2.06 1.304-2.764 3.333-3.334-2.03-.57-2.763-1.273-3.333-3.333zM9.333 5.833C8.335 9.438 7.052 10.67 3.5 11.667c3.552.996 4.835 2.228 5.833 5.833.998-3.605 2.282-4.837 5.834-5.833-3.552-.997-4.836-2.23-5.834-5.834z"
			fill="currentColor"
		/>
	),
});

export default AIIcon;
