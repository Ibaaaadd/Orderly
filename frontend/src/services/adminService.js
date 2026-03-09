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
export const getOrders = () => api.get('/orders')
