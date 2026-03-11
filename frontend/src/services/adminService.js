import api from './api'

// ─── Categories ───────────────────────────────────────────────
export const getCategories = () => api.get('/categories')
export const createCategory = (data) => api.post('/categories', data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// ─── Menus ────────────────────────────────────────────────────
export const getMenus = (params) => api.get('/menus', { params })
export const createMenu = (data) => api.post('/menus', data)
export const updateMenu = (id, data) => api.put(`/menus/${id}`, data)
export const deleteMenu = (id) => api.delete(`/menus/${id}`)

// ─── Orders ───────────────────────────────────────────────────
export const getOrders = (params) => api.get('/orders', { params })

// ─── Reports ──────────────────────────────────────────────────
export const getReportSummary   = ()     => api.get('/reports/summary')
export const getMonthlyReport   = (year) => api.get('/reports/monthly', { params: { year } })
export const getTopMenus        = (limit = 10) => api.get('/reports/top-menus', { params: { limit } })
