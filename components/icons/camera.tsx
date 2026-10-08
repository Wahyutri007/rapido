import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const CameraIcon = createIcon({
	name: "CameraIcon",
	viewBox: "0 0 24 24",
	path: (
		<>
			<Path
				d="M8 20H6a2 2 0 01-2-2v-2m12 4h2a2 2 0 002-2v-2M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2M8 13.5v-3A1.5 1.5 0 019.5 9h.086a1 1 0 00.707-.293l.268-.268A1.5 1.5 0 0111.62 8h.758a1.5 1.5 0 011.06.44l.268.267a1 1 0 00.707.293h.086a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 13.5z"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M12 11.85v-.01m.5.01a.5.5 0 11-1 0 .5.5 0 011 0z"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</>
	),
});

export default CameraIcon;
