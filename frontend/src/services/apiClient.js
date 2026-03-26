import axios from "axios"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true  // allow the browser to send/receice cookies
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config()

    // if 401 (Expired) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return originalRequest
        })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // use axios directly or a specific endpoint to avoide entercepter loop
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {}, { withCredentials: true })
        
        const { accessToken } = data.data
        // Store in Memory/State via a callback or event if preferred
        // here we use the headers for the retry.

        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)

      } catch (error) {
        processQueue(error, null)
        // Refresh failed? kick to login
        window.location.href = "/login"
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient