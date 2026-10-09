import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { mapFormErrors } from "@/lib/api-utils";
import type { PersonalInfoSchema } from "@/schema/registration";
import type { VerifyDataResponse } from "@/types/api/registration";
import { createMutationHook } from "../factory";

const useRegistrationMutation = createMutationHook<
	VerifyDataResponse,
	PersonalInfoSchema
>({
	path: "/register/start",
	method: "post",
	name: "registration",
});

export function useRegistrationStartRequest(
	form: UseFormReturn<PersonalInfoSchema>,
) {
	const mutation = useRegistrationMutation();
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
		if (apiError?.status === 429) {
			const cooldown = z
				.object({ seconds: z.number().finite().positive() })
				.safeParse(apiError.errors);
			form.setError("email", {
				message: `Terlalu banyak percobaan pendaftaran. ${cooldown.success ? `Coba lagi dalam ${cooldown.data.seconds} detik.` : "Silakan coba lagi nanti."}`,
			});
			return;
		}

		if (apiError?.status === 422) {
			const validation = z
				.record(z.array(z.string().min(1)).nonempty())
				.safeParse(apiError.errors);
			if (validation.success && Object.keys(validation.data).length > 0) {
				mapFormErrors(form, validation.data);
				return;
			}
		}

		form.setError("email", {
			message: "Terjadi kesalahan. Silakan coba lagi.",
		});
	}

	async function call(data: PersonalInfoSchema) {
		if (!mounted.current || submitting.current) return [null, null] as const;
		submitting.current = true;
		setLoading(true);
		try {
			const result = await mutation.call(data);
			if (mounted.current && result[1]) handleError(result[1]);
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
