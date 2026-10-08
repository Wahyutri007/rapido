import { APIResponse, QueryResponse } from "@/types/api";
import { axios } from "./axios";
import { handleFetchError } from "@/lib/api-utils";
import { AxiosRequestConfig } from "axios";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export async function get<T = any>(
  path: string,
  name: string = "data",
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data: body } = await axios.get<APIResponse<T>>(path, config);

    if (!body.success) {
      throw new Error(`Failed to fetch ${name}`);
    }

    return body.data;
  } catch (error) {
    throw handleFetchError(error);
  }
}

export async function post<T = any, E = any>(
  path: string,
  data: any,
  name: string = "data",
  config?: AxiosRequestConfig,
): Promise<QueryResponse<T>> {
  try {
    const response = await axios.post<APIResponse<T>>(path, data, config);

    if (!response.data.success) {
      throw new Error(`Failed to post ${name}`);
    }

    return response.data;
  } catch (error) {
    return handleFetchError<E>(error);
  }
}

export async function put<T = any, E = any>(
  path: string,
  data: any,
  name: string = "data",
  config?: AxiosRequestConfig,
): Promise<QueryResponse<T>> {
  try {
    const response = await axios.put<APIResponse<T>>(path, data, config);

    if (!response.data.success) {
      throw new Error(`Failed to put ${name}`);
    }

    return response.data;
  } catch (error) {
    return handleFetchError<E>(error);
  }
}

export async function del<T = any, E = any>(
  path: string,
  name: string = "data",
  config?: AxiosRequestConfig,
): Promise<QueryResponse<T>> {
  try {
    const response = await axios.delete<APIResponse<T>>(path, config);

    if (!response.data.success) {
      throw new Error(`Failed to delete ${name}`);
    }

    return response.data;
  } catch (error) {
    return handleFetchError<E>(error);
  }
}

// A function to help with easily create post requests
export function createPost<R = any, T = any, E = any>(
  path: string,
  name: string = "data",
  config?: AxiosRequestConfig,
) {
  return async function (data: R) {
    return await post<T, E>(path, data, name, config);
  };
}

export function handleFormError<T extends FieldValues>(
  error: any,
  form: UseFormReturn<T>,
) {
  if (error?.status === 422 && error?.errors) {
    Object.keys(error.errors).forEach((key) => {
      const message = error.errors[key][0];
      try {
        form.setError(key as Path<T>, {
          type: "server",
          message,
        });
      } catch (err) {
        console.warn(`Failed to map server error for field "${key}":`, err);
      }
    });
    return true; // Handled
  }
  return false; // Not handled
}
