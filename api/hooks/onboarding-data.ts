import { createGetHook } from "../factory";
import { OnboardingData } from "@/types/api/onboarding";

const useOnboardingDataQuery = createGetHook<OnboardingData[]>({
  path: "onboarding-data",
  queryKey: ["onboarding-data"],
  name: "onboarding data",
});

export default useOnboardingDataQuery;
