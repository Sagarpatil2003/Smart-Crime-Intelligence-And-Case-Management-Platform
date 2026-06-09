// src/features/auth/api/apiClient.jsx
import axios from "axios";

const PRODUCTION_BACKEND = "https://smart-crime-intelligence-and-case.onrender.com";

let envURL = import.meta.env.VITE_API_URL;
if (!envURL || envURL === "undefined" || envURL.trim() === "") {
  envURL = PRODUCTION_BACKEND;
}

const apiClient = axios.create({
  baseURL: envURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

// Request Interceptor: Attach Access Token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration cleanly
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register") ||
      originalRequest.url.includes("/auth/refresh-token") ||
      originalRequest.url.includes("/auth/signup");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const backupToken = localStorage.getItem("rt_backup_channel");

        const response = await axios.post(
          `${envURL}/auth/refresh-token`,
          {},
          {
            withCredentials: true
          }
        );

        const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("rt_backup_channel", newRefreshToken);
        }

        // Normalize MongoDB structural elements if payload uses raw layout objects
        if (user) {
          const formattedUser = {
            id: user.id || user._id,
            name: user.name,
            role: user.role
          };
          localStorage.setItem("user", JSON.stringify(formattedUser));
        }

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('rt_backup_channel');
        localStorage.removeItem('user');

        const publicPages = ["/login", "/signup", "/register"];
        if (!publicPages.includes(window.location.pathname)) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;