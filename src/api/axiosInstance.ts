import axios from "axios";

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost/trakjobs-api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    return Promise.reject(err);
  },
);

export default api;
