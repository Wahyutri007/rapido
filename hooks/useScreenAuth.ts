import { useAuth } from "@/context/AuthContext";
import useCustomRouter from "./useCustomRouter";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

type UseScreenAuthOptions = {
  requireAll?: boolean;
  redirectTo?: string;
};

export default function useScreenAuth(
  requiredPermissions: string | string[],
  options?: UseScreenAuthOptions,
) {
  const {
    authenticated,
    isLoading,
    isLoaded,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    user,
  } = useAuth();
  const { replaceWithParams } = useCustomRouter();

  useFocusEffect(
    useCallback(() => {
      if (!isLoaded || isLoading || !authenticated) {
        return;
      }

      const permissionsArray = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      let isAuthorized = false;

      if (permissionsArray.length === 0 || user?.roles.includes("owner")) {
        isAuthorized = true;
      } else if (permissionsArray.length === 1) {
        isAuthorized = hasPermission(permissionsArray[0]);
      } else if (options?.requireAll) {
        isAuthorized = hasAllPermissions(permissionsArray);
      } else {
        isAuthorized = hasAnyPermission(permissionsArray);
      }

      if (!isAuthorized) {
        replaceWithParams((options?.redirectTo || "/(back-office)/home") as any);
      }
    }, [
      isLoaded,
      isLoading,
      authenticated,
      requiredPermissions,
      options?.requireAll,
      options?.redirectTo,
      hasPermission,
      hasAllPermissions,
      hasAnyPermission,
      replaceWithParams,
      user?.roles,
    ]),
  );
}
