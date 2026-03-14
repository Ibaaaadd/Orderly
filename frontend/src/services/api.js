import axios from 'axios'
import { getAdminToken, logoutAdmin } from '../utils/adminAuth.js'

/**
 * Axios instance – base URL points to the Express backend.
 * In development the Vite proxy forwards /api → http://localhost:5000.
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ---------- Request interceptor ----------
api.interceptors.request.use(
  (config) => {
    const token = getAdminToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---------- Response interceptor ----------
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      logoutAdmin()
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Terjadi kesalahan. Silakan coba lagi.'
    return Promise.reject(new Error(message))
  }
)

export default api
