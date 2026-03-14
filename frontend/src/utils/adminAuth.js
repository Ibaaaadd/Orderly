const ADMIN_AUTH_KEY = 'orderly_admin_authenticated'
const ADMIN_LOGIN_AT_KEY = 'orderly_admin_login_at'
const ADMIN_TOKEN_KEY = 'orderly_admin_token'
const ADMIN_USER_KEY = 'orderly_admin_user'

export function setAdminSession({ token, user }) {
  if (!token) return
  localStorage.setItem(ADMIN_AUTH_KEY, 'true')
  localStorage.setItem(ADMIN_LOGIN_AT_KEY, new Date().toISOString())
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
  if (user) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
  }
}

export function isAdminAuthenticated() {
  const isAuth = localStorage.getItem(ADMIN_AUTH_KEY) === 'true'
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  return Boolean(isAuth && token)
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function getAdminUser() {
  const raw = localStorage.getItem(ADMIN_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_AUTH_KEY)
  localStorage.removeItem(ADMIN_LOGIN_AT_KEY)
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_USER_KEY)
}
