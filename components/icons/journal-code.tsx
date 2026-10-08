import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const JournalCodeIcon = createIcon({
	name: "JournalCodeIcon",
	viewBox: "0 0 16 16",
	path: (
		<>
			<Path
				d="M13.3359 10.9993V5.33268C13.3359 4.62544 13.055 3.94716 12.5549 3.44706C12.0548 2.94697 11.3765 2.66602 10.6693 2.66602H5.0026C4.29536 2.66602 3.61708 2.94697 3.11699 3.44706C2.61689 3.94716 2.33594 4.62544 2.33594 5.33268V9.89468C2.33592 10.245 2.40492 10.5918 2.53898 10.9154C2.67305 11.239 2.86955 11.533 3.11727 11.7807L4.22127 12.8847C4.46891 13.1324 4.76294 13.3289 5.08654 13.463C5.41015 13.597 5.75699 13.666 6.10727 13.666H10.6693C11.3765 13.666 12.0548 13.3851 12.5549 12.885C13.055 12.3849 13.3359 11.7066 13.3359 10.9993Z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M6.67187 13.6654V11.332C6.67187 10.8016 6.46116 10.2929 6.08609 9.91782C5.71102 9.54275 5.20231 9.33203 4.67187 9.33203H2.33854M10.6719 5.33203V10.332M8.00521 5.33203V8.66536"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</>
	),
});

export default JournalCodeIcon;
