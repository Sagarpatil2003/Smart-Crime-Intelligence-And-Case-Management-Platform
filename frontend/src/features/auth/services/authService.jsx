import apiClient from "../api/apiClient"


/**
 * Register a new user
 */
const register = async (userData) => {
    // DON'T re-format here if you already did it in the Component!
    // Just send userData directly.
    const response = await apiClient.post('/auth/register', userData);

    if (response.data?.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
    }
    return response.data.data;
};

/**
 * Login Existing user
 */
const login = async (credentials) => {
    // ✅ Fixed typo here
    console.log("Attempting login with credentials:", credentials) 
    
    const response = await apiClient.post('/auth/login', credentials)
    // console.log("Received response from login API:", response)
    const { accessToken, user } = response.data.data

    // Save the accessToken for the Interceptors use
    localStorage.setItem("accessToken", accessToken)

    return { user, accessToken }
}

/**
 * LogOut and clear session
 */
const logout = async () => {
    try {
        // This triggers the backend clearCookie('refreshToken')
        await apiClient.post("/auth/logout")
    } catch (err) {
        console.error("Server-side logout failed", err)
    } finally {
        // Always clear local data even if server call fails
        localStorage.removeItem("accessToken")
        localStorage.clear()
        window.location.href = "/login"
    }
};

/**
 * Refresh token 
 */
const refresh = async () => {
    // apiClient has 'withCredentials: true', so the cookie is sent automatically
    const response = await apiClient.post('/auth/refresh-token')

    // Save the new accessToken returned by the rotation logic
    localStorage.setItem("accessToken", response.data.data.accessToken)

    return response.data.data
}

export default { login, logout, register, refresh }