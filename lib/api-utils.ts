import { QueryCatchFallback } from "@/types/api";
import { ValidationError } from "@/types/api/misc";
import { AxiosError } from "axios";
import { UseFormReturn } from "react-hook-form";

export function handleFetchError<T = any>(error: unknown): QueryCatchFallback<T> {
  if (error instanceof AxiosError) {
    if (error.response?.data && typeof error.response.data === "object") {
      const data = error.response.data as QueryCatchFallback<T>;
      return {
        success: data.success ?? false,
        status: error.response.status,
        message: data.message || "Terjadi kesalahan pada server",
        errors: (data.errors ?? (error.message as unknown)) as T,
      };
    }

    const isNetworkError = error.message === "Network Error" || !error.response;
    const isTimeout = error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout");

    return {
      success: false,
      status: error.response?.status ?? (isTimeout ? 408 : 500),
      message: isTimeout
        ? "Waktu permintaan habis. Silakan coba lagi."
        : isNetworkError
          ? "Tidak dapat terhubung ke server. Periksa jaringan atau server."
          : error.message || "Terjadi kesalahan pada server",
      errors: (error.message as unknown) as T,
    };
  }

  return {
    success: false,
    status: 500,
    message: error instanceof Error ? error.message : "Terjadi kesalahan pada server",
    errors: (error instanceof Error ? error.message : "Unknown error") as unknown as T,
  };
}

export function queryFallback(error: unknown) {
  if (error instanceof AxiosError) {
    const message =
      error.response?.data?.message ||
      (error.message === "Network Error"
        ? "Tidak dapat terhubung ke server. Periksa jaringan."
        : error.message || "Terjadi kesalahan");
    throw new Error(message);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Terjadi kesalahan yang tidak diketahui");
}

export function mapFormErrors<E extends ValidationError>(
  // Error must atleast be an object first
  form: UseFormReturn<any>,
  errors: ValidationError,
  only?: (keyof E)[],
) {
  let mappedEntries = 0;

  Object.entries(errors).forEach(([key, value]) => {
    if (only && !only.includes(key as keyof E)) return;

    form.setError(key, {
      message: (value as string[]).join(" "),
    });

    mappedEntries++;
  });

  return mappedEntries;
}
