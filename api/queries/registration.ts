import { PersonalInfoSchema } from "@/schema/registration";
import { APIResponse, QueryResponse } from "@/types/api";
import { VerifyDataResponse } from "@/types/api/registration";
import { axios } from "../axios";
import { handleFetchError } from "@/lib/api-utils";

export async function startRegistrationProcess(
  form: PersonalInfoSchema,
): Promise<QueryResponse<VerifyDataResponse>> {
  try {
    const response = await axios.post<APIResponse<VerifyDataResponse>>(
      "register/start",
      form,
    );

    if (!response.data.success) {
      throw new Error("Failed to start registration process");
    }

    return response.data;
  } catch (error) {
    return handleFetchError<VerifyDataResponse>(error);
  }
}
