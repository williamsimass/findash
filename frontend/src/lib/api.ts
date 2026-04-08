import axios from 'axios'
import type { CreateTransactionDto } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; full_name: string; password: string }) =>
    api.post('/auth/register', data),
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  updateMe: (data: { full_name?: string; avatar_icon?: string; theme?: string }) =>
    api.put('/users/me', data),
  changePassword: (current_password: string, new_password: string) =>
    api.put('/users/me/password', { current_password, new_password }),
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/transactions', { params }),
  summary: () => api.get('/transactions/summary'),
  create: (data: CreateTransactionDto) => api.post('/transactions', data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
}

// ─── Installments ─────────────────────────────────────────────────────────────
export const installmentsApi = {
  pay:   (id: number) => api.put(`/installments/${id}/pay`),
  unpay: (id: number) => api.put(`/installments/${id}/unpay`),
}
