import apiClient from "../api/apiClient";

/**
 * Register a new user node
 */
const register = async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    
    // Safety check nested envelope access parameters safely
    if (response.data?.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
    }
    
    // Return the primary data root payload fallback safely
    return response.data?.data || response.data;
};

/**
 * Log in authorized credentials
 */
const login = async (credentials) => {
    console.log("Attempting login with credentials:", credentials); 
    
    const response = await apiClient.post('/auth/login', credentials);
    
    // Extract both standard payload values and the backup fallback token
    const { accessToken, refreshToken, user } = response.data.data;

    // 1. Core Token tracking
    localStorage.setItem("accessToken", accessToken);
    
    // 2. Production Cross-Origin Domain Backup Channel Safeguard
    if (refreshToken) {
        localStorage.setItem("rt_backup_channel", refreshToken);
    }
    
    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    return { user, accessToken };
};

/**
 * LogOut and purge state records
 */
const logout = async () => {
    try {
        await apiClient.post("/auth/logout");
    } catch (err) {
        console.error("Server-side session cancellation failed:", err);
    } finally {
        // Absolute local cleansing cascade sequence
        localStorage.removeItem("accessToken");
        localStorage.removeItem("rt_backup_channel");
        localStorage.removeItem("user");
        localStorage.clear();
        sessionStorage.clear();
        
        window.location.href = "/login";
    }
};

/**
 * Refresh active session validation rules
 */
const refresh = async () => {
    // Read the fallback backup token tracking channel from local memory 
    const backupToken = localStorage.getItem("rt_backup_channel");

    // Pass the token inside a custom header as a backup in case the cookie is blocked
    const response = await apiClient.post('/auth/refresh-token', {}, {
        headers: {
            "X-Refresh-Token": backupToken || ""
        }
    });
    
    // Guard tracking check: Ensure response payload data node layers are valid
    if (!response.data || !response.data.data) {
        throw new Error("Invalid or corrupted token refresh payload mapping architecture.");
    }

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
    }
    
    if (newRefreshToken) {
        localStorage.setItem("rt_backup_channel", newRefreshToken);
    }

    return response.data.data;
};

export default { login, logout, register, refresh };