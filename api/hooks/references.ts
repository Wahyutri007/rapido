import { createGetHook } from "../factory";
import { ReferenceData } from "@/types/api/reference";

export const useReferenceDataQuery = (key: string) =>
  createGetHook<ReferenceData[]>({
    path: `/reference-data/${key}`,
    queryKey: ["reference-data", key],
    name: `reference_data_${key}`,
  })();
