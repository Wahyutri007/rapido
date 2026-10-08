export type BaseResponse = {
  status: number;
  message: string;
  success: boolean;
};

export type APISuccessResponse<T = unknown> = {
  success: true;
  data: T;
  [key: string]: unknown;
};

export type APIErrorResponse<E = unknown> = {
  success: false;
  errors: E;
};

export type APIResponse<
  T extends unknown = any,
  E extends unknown = any,
> = BaseResponse & (APISuccessResponse<T> | APIErrorResponse<E>);

export type QueryResponse<T = unknown, E = unknown> = APIResponse<T, E>;

export type QueryCatchFallback<T extends unknown = unknown> = BaseResponse &
  APIErrorResponse<T>;
