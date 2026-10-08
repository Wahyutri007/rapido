import { APIErrorResponse, APIResponse, QueryResponse } from "@/types/api";
import React from "react";

const DEV = true;

export type PostRequestHandler<R> = {
  onSuccess?: (data: R) => void;
  onError?: (error: APIResponse) => void;
};

type MutateFn<TData, TResult> = [TData] extends [void]
  ? (data?: TData, args?: any) => Promise<TResult>
  : (data: TData, args?: any) => Promise<TResult>;

/**
 * Hook for doing post request, handling loading state, success, and error callbacks.
 *
 * @param requestFn The function that performs the post request.
 * @param handlers Optional success and error handlers.
 * @returns An object containing the call function and loading state.
 */
export default function usePostRequest<T, R extends unknown>(
  requestFn: MutateFn<T, QueryResponse<R>>,
  { onSuccess, onError }: PostRequestHandler<R> = {},
) {
  const [isLoading, setLoading] = React.useState(false);

  const call = React.useCallback(
    async (data?: T, args?: any) => {
      setLoading(true);
      try {
        const response = await requestFn(data as T, args);

        if (!response.success) {
          throw response;
        }

        onSuccess?.(response.data);

        if (DEV) {
          console.log("SUCCESS", response.data);
        }

        return [response.data, null] as const;
      } catch (error) {
        onError?.(error as APIResponse);
        if (DEV) {
          console.log("ERROR", error);
        }
        return [null, error as APIResponse] as const;
      } finally {
        setLoading(false);
      }
    },
    [requestFn, onSuccess, onError],
  );

  return {
    call,
    isLoading,
  };
}
