import { EXAMPLES } from "./examples";
import { ICONS } from "./icons";
import { ILLUSTRATIONS } from "./illustrations";

const UNSORTED = {
	splash: require("./splash.png"),
	logo_256_transparent: require("./logo-256-transparent.png"),
	onboarding_1: require("./onboarding-1.png"),
	onboarding_2: require("./onboarding-2.png"),
	onboarding_3: require("./onboarding-3.png"),
	step_1: require("./step-1.png"),
	step_2: require("./step-2.png"),
	step_3: require("./step-3.png"),
	home_store_active: require("./home-store-active.jpg"),
	home_store_inactive: require("./home-store-inactive.jpg"),
	login_portrait: require("./login-portrait.jpg"),
};

export const IMAGES = {
	...UNSORTED,
	icons: ICONS,
	examples: EXAMPLES,
	illustrations: ILLUSTRATIONS,
};
