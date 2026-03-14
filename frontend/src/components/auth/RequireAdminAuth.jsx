import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAdminAuthenticated } from '../../utils/adminAuth.js'

export default function RequireAdminAuth() {
  const location = useLocation()

  if (!isAdminAuthenticated()) {
    const redirectTo = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)
    return <Navigate to={`/admin/login?redirect=${redirectTo}`} replace />
  }

  return <Outlet />
}
