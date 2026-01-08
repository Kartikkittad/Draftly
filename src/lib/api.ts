import axios from "axios";
import { updateTemplateSchema } from "./schema";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const LOGIN_REDIRECT_URL = import.meta.env.VITE_APP_LOGIN_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined");
}

if (!LOGIN_REDIRECT_URL) {
  throw new Error("VITE_APP_LOGIN_URL is not defined");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

export const apiJson = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const getAccessToken = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  // If accessToken is missing, use refreshToken as fallback
  if (!token) {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return token;
};
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const clearAuth = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ attach accessToken
apiJson.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ redirect ONLY if accessToken is missing or expired
// const setupAuthGuard = (apiInstance: any) => {
//   apiInstance.interceptors.response.use(
//     (res) => res,
//     (error) => {
//       if (error.response?.status === 401) {
//         clearAuth();

//         // 🔥 redirect to NEXT.JS login (NOT builder)
//         window.location.href = LOGIN_REDIRECT_URL;
//       }

//       return Promise.reject(error);
//     }
//   );
// };

// setupAuthGuard(api);
// setupAuthGuard(apiJson);

apiJson.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh/token"
    ) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuth();
        window.location.href = import.meta.env.VITE_APP_LOGIN_URL;
        return Promise.reject(error);
      }

      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh/token`,
          null,
          {
            headers: {
              "refresh-token": refreshToken,
            },
          }
        );

        const { access_token, refresh_token } = refreshRes.data;

        if (!access_token) throw new Error("No access token from refresh");

        setTokens(access_token, refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiJson(originalRequest);
      } catch (err) {
        clearAuth();
        window.location.href = import.meta.env.VITE_APP_LOGIN_URL;
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export const updateTemplate = async (
  templateId: string,
  payload: {
    name?: string | null;
    subject?: string | null;
    htmlBody?: string | null;
    editorJson?: any | null;
    fromEmailUsername?: string | null;
  }
) => {
  // Validate payload with schema
  const validatedPayload = updateTemplateSchema.parse(payload);

  const response = await apiJson.put(
    `/templates/${templateId}`,
    validatedPayload
  );
  return response.data.data;
};

export default api;
