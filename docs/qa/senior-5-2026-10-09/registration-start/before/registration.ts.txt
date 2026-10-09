import { createMutationHook } from "../factory";
import { PersonalInfoSchema } from "@/schema/registration";
import { UseFormReturn } from "react-hook-form";
import { mapFormErrors } from "@/lib/api-utils";
import { ValidationError } from "@/types/api/misc";
import { VerifyDataResponse } from "@/types/api/registration";

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
  return useRegistrationMutation({
    onError: (error) => {
      if (error.status === 429) {
        const seconds = error.errors?.seconds;

        form.setError("email", {
          message: `Terlalu banyak percobaan pendaftaran. ${seconds ? `Coba lagi dalam ${seconds} detik.` : "Silakan coba lagi nanti."}`,
        });
      }

      if (error.status === 422) {
        mapFormErrors(form, error.errors as ValidationError);
        return;
      }

      form.setError("email", {
        message: "Terjadi kesalahan. Silakan coba lagi.",
      });
    },
    onSuccess: (data) => {},
  });
}
