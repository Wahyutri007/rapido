import { router, useGlobalSearchParams } from "expo-router";
import React from "react";

export default function useSearchParamState<T >(key: string, defaultValue?: T ) {
  const [state, setState] = React.useState<T | undefined>(defaultValue);

  const params = useGlobalSearchParams();

  React.useEffect(() => {
    if (params[key] !== undefined) {
      setState(params[key] as T);
    } else {
      setState(defaultValue); // Reset to default if the param is missing
    }
  }, [params]);

  React.useEffect(() => {
    // Use a debounce function to delay the update of the search param
    const timeoutId = setTimeout(() => {
      router.setParams({
        [key]: state as string,
      });
    }, 250); // Adjust the debounce time as needed

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state]);

  return [state, setState] as const;
}
