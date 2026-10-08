import {
  Href,
  useRouter as useExpoRouter,
  useGlobalSearchParams,
} from "expo-router";

function encodeParams(params: Record<string, any> = {}) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === "object" ? JSON.stringify(value) : value,
    ]),
  );
}

export default function useCustomRouter() {
  const router = useExpoRouter();
  const params = useGlobalSearchParams();

  function pushWithParams(
    path: Href,
    newParams?: Record<string, any>,
    options?: { merge?: boolean },
  ) {
    const targetParams = options?.merge
      ? { ...params, ...encodeParams(newParams) }
      : encodeParams(newParams);

    router.push({
      pathname: path as any,
      params: targetParams,
    });
  }

  function replaceWithParams(
    path: Href,
    newParams?: Record<string, any>,
    options?: { merge?: boolean },
  ) {
    const targetParams = options?.merge
      ? { ...params, ...encodeParams(newParams) }
      : encodeParams(newParams);

    router.replace({
      pathname: path as any,
      params: targetParams,
    });
  }

  return {
    router,
    params,
    pushWithParams,
    replaceWithParams,
  };
}
