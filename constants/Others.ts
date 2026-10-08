export const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL ||
  (process.env.EXPO_PUBLIC_API_URL ? process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, "") : "http://192.168.100.139:8000");

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || `${BASE_URL}/api`;
