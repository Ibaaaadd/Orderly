import axios from 'axios'

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
  (config) => config,
  (error) => Promise.reject(error)
)

// ---------- Response interceptor ----------
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Terjadi kesalahan. Silakan coba lagi.'
    return Promise.reject(new Error(message))
  }
)

export default api
