import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL
const apiClient = axios.create({
  baseURL,
  withCredentials: true // MANDATORY: Allows cookies to be sent/reseived
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}

// Request Interceptor: Attach Access Token to every request 
// Runs before every API call :- apiClient.interceptors.request.use
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))


//Response Interceptor: Handle Token Expiration
// ... [rest of your code above]
apiClient.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;

    // 1. Define routes that SHOULD NOT trigger a token refresh
    const isAuthRoute =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register") ||
      originalRequest.url.includes("/auth/refresh-token") ||
      originalRequest.url.includes("/auth/signup"); // Added signup just in case

    // 2. Handle 401 errors
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
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true });

        // Ensure your backend nesting matches: response.data.data.accessToken
        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');

        // 3. Don't redirect if the user is already on a public page
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