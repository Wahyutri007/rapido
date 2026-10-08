import { OnboardingItemProps } from "@/components/feature/onboarding/OnboardingItem";
import { OnboardingData } from "@/types/api/onboarding";

export default function transformOnboardingData(
  data: OnboardingData,
): OnboardingItemProps {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    image: data.image,
    image_url: data.image_url,
  };
}
