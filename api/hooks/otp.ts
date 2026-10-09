import type { PersonalInfoSchema } from "@/schema/registration";
import type { VerifyDataResponse } from "@/types/api/registration";
import { createMutationHook } from "../factory";

export const useRegistrationResendRequest = createMutationHook<
	VerifyDataResponse,
	PersonalInfoSchema
>({
	path: "/register/start",
	method: "post",
	name: "registration",
});
