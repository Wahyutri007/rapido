import Keys from "@/constants/Keys";
import { API_URL } from "@/constants/Others";
import axios from "axios";
import * as SecureStore from "@/lib/storage";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(Keys.AUTH_TOKEN);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers["ngrok-skip-browser-warning"] = "true";
      }
    } catch (error) {}

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Check if code is "unauthenticated"
      if (error.response.data.errors?.code === "unauthenticated") {
        await SecureStore.deleteItemAsync(Keys.AUTH_TOKEN);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
export { apiClient as axios };
