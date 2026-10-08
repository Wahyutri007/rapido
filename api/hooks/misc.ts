import { createGetHook } from "../factory";
import { ApiHealthData } from "@/types/api/misc";

export const useApiHealthData = createGetHook<ApiHealthData>({
  path: "health",
  queryKey: "apiHealth",
  name: "api health",
  config: { timeout: 3000 },
});
