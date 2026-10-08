import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import type { LoginSchema } from "@/schema/onboarding/login";
import type {
	LoginData,
	LoginFailError,
	LoginFailLimited,
	UserData,
} from "@/types/api/auth";
import { createGetHook, createMutationHook } from "../factory";

const useLoginMutation = createMutationHook<LoginData, LoginSchema>({
	path: "/login",
	method: "post",
	name: "login",
});

const useLogoutMutation = createMutationHook<null, void>({
	path: "/logout",
	method: "post",
	name: "logout",
});

const useUserQuery = createGetHook<UserData>({
	path: "/user",
	queryKey: ["user-data"],
});

const loginFailSchema = z.object({
	attempts: z.number(),
	max_attempts: z.number(),
}) satisfies z.ZodType<LoginFailError>;

const loginLimitedSchema = z.object({
	seconds: z.number(),
}) satisfies z.ZodType<LoginFailLimited>;

export default function useLoginRequest(form: UseFormReturn<LoginSchema>) {
	const auth = useAuth();

	return useLoginMutation({
		onSuccess: async (data) => {
			await auth.updateToken(data.token);
		},
		onError: (error) => {
			if (error.status === 401) {
				const errors = loginFailSchema.safeParse(error.errors);

				if (!errors.success) {
					form.setError("email", {
						message: "Email atau password salah",
					});
					return;
				}

				const { data } = errors;

				if (data.attempts > 2) {
					const remainingAttempts = data.max_attempts - data.attempts;

					if (remainingAttempts <= 0) {
						form.setError("email", {
							message: `Terlalu banyak percobaan masuk. Coba lagi nanti.`,
						});
						return;
					}

					form.setError("email", {
						message: `Email atau password salah (${remainingAttempts} percobaan lagi)`,
					});
					return;
				}

				form.setError("email", {
					message: "Email atau password salah",
				});
			} else if (error.status === 429) {
				const errors = loginLimitedSchema.safeParse(error.errors);

				if (!errors.success) {
					form.setError("email", {
						message: "Terlalu banyak percobaan masuk. Coba lagi nanti.",
					});
					return;
				}

				const { data } = errors;

				form.setError("email", {
					message: `Terlalu banyak percobaan masuk. Coba lagi dalam ${data.seconds} detik.`,
				});
			} else {
				form.setError("email", {
					message: "Terdapat kesalahan. Silakan coba lagi.",
				});
			}
		},
	});
}

export function useLogoutRequest() {
	const auth = useAuth();

	return useLogoutMutation({
		onSuccess: async () => {
			await auth.updateToken(null);
		},
	});
}

export function useUserData() {
	return useUserQuery();
}
