import axios from "axios"
import apiClient from "../../services/apiClient"

const login = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    // We don't save the Refresh Token in JS! The backend sends it in a 'Set-Cookie' header.
    return response.data.data;
} 