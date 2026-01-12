import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const LOGIN_REDIRECT_URL = import.meta.env.VITE_APP_LOGIN_URL;

if (!API_BASE_URL) throw new Error("VITE_API_URL is not defined");
if (!LOGIN_REDIRECT_URL) throw new Error("VITE_APP_LOGIN_URL is not defined");

const ACCESS_TOKEN_KEY = "accessToken";

export const apiJson = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiJson.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiJson.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");

      const path = window.location.pathname;

      if (path !== "/login" && path !== "/register") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export function logout() {
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
}
