import axios from 'axios'

// Base axios instance — Vite proxies /api to localhost:3001
const axiosInstance = axios.create({
baseURL: '/api',
withCredentials: true,   // sends httpOnly cookies automatically
headers: { 'Content-Type': 'application/json' },
timeout: 15000,
})

// Response interceptor: unwrap { success, data, message } envelope
axiosInstance.interceptors.response.use(
(response) => response,
(error) => {
const message = error.response?.data?.error ?? error.message ?? 'Network error'
const code    = error.response?.data?.code  ?? 'NETWORK_ERROR'
const status  = error.response?.status      ?? 0
return Promise.reject({ message, code, status })
}
)

// Typed API client — all functions return the unwrapped data
export const api = {
get:    <T>(url: string, params?: object) =>
axiosInstance.get<{ success: boolean; data: T }>(url, { params }).then(r => r.data.data),

post:   <T>(url: string, data?: object) =>
axiosInstance.post<{ success: boolean; data: T }>(url, data).then(r => r.data.data),

put:    <T>(url: string, data?: object) =>
axiosInstance.put<{ success: boolean; data: T }>(url, data).then(r => r.data.data),

patch:  <T>(url: string, data?: object) =>
axiosInstance.patch<{ success: boolean; data: T }>(url, data).then(r => r.data.data),

delete: <T>(url: string) =>
axiosInstance.delete<{ success: boolean; data: T }>(url).then(r => r.data.data),

// For file downloads (CSV, PDF) — returns blob
download: (url: string, params?: object) =>
axiosInstance.get(url, { params, responseType: 'blob' }).then(r => r.data),
}
