import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Common from "./common";
import { QueryResponse } from "@/types/api";
import usePostRequest, { PostRequestHandler } from "@/hooks/usePostRequest";
import { AxiosRequestConfig } from "axios";

export type CreateGetHookOptions<TArgs = any> = {
  path: string | ((args: TArgs) => string);
  queryKey: string | string[] | ((args: TArgs) => string[]);
  name?: string;
  config?: AxiosRequestConfig;
};

/**
 * Creates a custom hook for fetching data using a GET request.
 */
export function createGetHook<T, TArgs = any>({
  path,
  queryKey,
  name = "data",
  config,
}: CreateGetHookOptions<TArgs>) {
  return function useGetRequest(args?: any, options?: { enabled?: boolean }) {
    const isDynamic = typeof path === "function";
    const hasArgs = args !== undefined && args !== null && args !== "";

    const autoEnabled = isDynamic ? hasArgs : true;
    const isEnabled = options?.enabled ?? autoEnabled;

    const actualPath =
      isDynamic && isEnabled
        ? path(args)
        : typeof path === "string"
          ? path
          : "";

    const actualKey =
      typeof queryKey === "function" && hasArgs ? queryKey(args) : queryKey;

    const finalKey = Array.isArray(actualKey) ? [...actualKey] : [actualKey];

    if (typeof queryKey !== "function" && hasArgs) {
      finalKey.push(args);
    }

    return useQuery({
      queryKey: finalKey,
      queryFn: () => {
        let finalConfig = config;
        if (args && typeof args === "object" && !Array.isArray(args)) {
          finalConfig = {
            ...config,
            params: {
              ...config?.params,
              ...args,
            },
          };
        }
        return Common.get<T>(actualPath, name, finalConfig);
      },
      enabled: isEnabled,
    });
  };
}

type MutationHttpMethod = "post" | "put" | "delete";

export type InvalidateQueryKey = string | any[];
export type InvalidateKeysOption<TData = any, TPayload = any, TArgs = any> =
  | InvalidateQueryKey
  | InvalidateQueryKey[]
  | ((data: TData, payload: TPayload, args: TArgs) => InvalidateQueryKey | InvalidateQueryKey[]);

export type CreateMutationHookOptions<TData = any, TPayload = any, TArgs = any> = {
  path: string | ((args: TArgs) => string);
  method?: MutationHttpMethod;
  name?: string;
  config?: AxiosRequestConfig;
  invalidateKeys?: InvalidateKeysOption<TData, TPayload, TArgs>;
};

/**
 * Creates a custom hook for mutating data using POST, PUT, or DELETE with optional auto cache invalidation.
 */
export function createMutationHook<TData, TPayload = any, TArgs = any>({
  path,
  method = "post",
  name = "data",
  config,
  invalidateKeys,
}: CreateMutationHookOptions<TData, TPayload, TArgs>) {
  return function useMutationRequest(
    options?: PostRequestHandler<TData>,
    hookArgs?: any,
  ) {
    const queryClient = useQueryClient();

    const mutationFn = async (data: TPayload, callArgs?: any) => {
      const actualArgs = callArgs !== undefined ? callArgs : hookArgs;
      const actualPath = typeof path === "function" ? path(actualArgs) : path;
      let response: QueryResponse<TData>;
      let finalConfig = config;
      if (actualArgs && typeof actualArgs === "object" && !Array.isArray(actualArgs)) {
        finalConfig = {
          ...config,
          params: {
            ...config?.params,
            ...actualArgs,
          },
        };
      }

      switch (method) {
        case "post":
          response = await Common.post<TData>(actualPath, data, name, finalConfig);
          break;
        case "put":
          response = await Common.put<TData>(actualPath, data, name, finalConfig);
          break;
        case "delete":
          response = await Common.del<TData>(actualPath, name, finalConfig);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Automatically invalidate queries on successful mutation
      if (response.success && invalidateKeys) {
        try {
          const resolved =
            typeof invalidateKeys === "function"
              ? invalidateKeys(response.data, data, actualArgs)
              : invalidateKeys;

          if (resolved) {
            const isArrayOfKeys =
              Array.isArray(resolved) &&
              resolved.length > 0 &&
              Array.isArray(resolved[0]);

            const keysList = isArrayOfKeys
              ? (resolved as any[][])
              : [Array.isArray(resolved) ? (resolved as any[]) : [resolved]];

            for (const key of keysList) {
              queryClient.invalidateQueries({
                queryKey: Array.isArray(key) ? key : [key],
              });
            }
          }
        } catch (err) {
          console.warn("Failed to auto-invalidate query keys:", err);
        }
      }

      return response;
    };

    return usePostRequest(mutationFn as any, options);
  };
}
