import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const CalculatorIcon = createIcon({
	name: "CalculatorIcon",
	viewBox: "0 0 16 16",
	path: (
		<Path
			d="M3.66927 1.9987V5.33203M5.33594 3.66536H2.0026M5.33594 10.6654L4.0026 11.9987M4.0026 11.9987L2.66927 13.332M4.0026 11.9987L5.33594 13.332M4.0026 11.9987L2.66927 10.6654M13.3359 3.9987H10.6693M13.3359 12.332H10.6693M13.3359 10.332H10.6693M14.6693 7.9987H1.33594M8.0026 14.6654V1.33203"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
});

export default CalculatorIcon;
