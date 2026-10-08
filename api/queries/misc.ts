import { APIResponse } from "@/types/api";
import { axios } from "../axios";
import { handleFetchError } from "@/lib/api-utils";
import { ApiHealthData } from "@/types/api/misc";

// * React Query
export async function getApiHealthData(): Promise<ApiHealthData> {
  try {
    const { data: body } = await axios.get<APIResponse<ApiHealthData>>(
      "health",
      {
        timeout: 3000, // 3 seconds
      },
    );

    if (!body.success) {
      throw new Error("Failed to fetch api health");
    }

    return body.data;
  } catch (error) {
    throw handleFetchError(error);
  }
}
