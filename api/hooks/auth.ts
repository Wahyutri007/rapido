import React from "react";
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
	const mutation = useLoginMutation();
	const mounted = React.useRef(true);
	const submitting = React.useRef(false);
	const [isLoading, setLoading] = React.useState(false);

	React.useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	function handleError(error: unknown) {
		const apiError = error as { status?: number; errors?: unknown } | undefined;
		if (apiError?.status === 401) {
			const errors = loginFailSchema.safeParse(apiError.errors);

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
		} else if (apiError?.status === 429) {
			const errors = loginLimitedSchema.safeParse(apiError.errors);

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
	}

	async function call(data: LoginSchema) {
		// Lock before awaiting: loading from a render cannot block queued presses.
		if (!mounted.current || submitting.current) return [null, null] as const;
		submitting.current = true;
		setLoading(true);
		try {
			const result = await mutation.call(data);
			if (!mounted.current) return result;
			const [response, error] = result;
			if (error) handleError(error);
			else if (response) await auth.updateToken(response.token);
			return result;
		} catch (error) {
			if (mounted.current) handleError(error);
			return [null, error] as const;
		} finally {
			submitting.current = false;
			if (mounted.current) setLoading(false);
		}
	}

	return { call, isLoading };
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
