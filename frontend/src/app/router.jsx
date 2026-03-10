import React, { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import Container from '../components/layout/Container.jsx'
import MenuPage from '../pages/MenuPage.jsx'
import CartPage from '../pages/CartPage.jsx'
import PaymentPage from '../pages/PaymentPage.jsx'
import SuccessPage from '../pages/SuccessPage.jsx'
import OrdersPage from '../pages/OrdersPage.jsx'

// Lazy-load admin pages to split heavy chart / print libraries into a separate chunk
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage.jsx'))
const AdminMenuPage      = lazy(() => import('../pages/admin/AdminMenuPage.jsx'))
const AdminCategoryPage  = lazy(() => import('../pages/admin/AdminCategoryPage.jsx'))
const AdminOrdersPage    = lazy(() => import('../pages/admin/AdminOrdersPage.jsx'))
const AdminReportPage    = lazy(() => import('../pages/admin/AdminReportPage.jsx'))

function AdminFallback() {
  return (
    <div className="flex items-center justify-center h-40 text-surface-400 text-sm">
      <svg className="animate-spin h-5 w-5 mr-2 text-primary-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Memuat…
    </div>
  )
}

/**
 * Layout wrapper — shared Navbar + Container around all routes.
 */
function RootLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      {children}
    </div>
  )
}

// Route-level layouts are handled via Outlet in react-router v6
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <Outlet />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',           element: <MenuPage /> },
      { path: '/cart',       element: <CartPage /> },
      { path: '/payment/:orderId', element: <PaymentPage /> },
      { path: '/success/:orderId', element: <SuccessPage /> },
      { path: '/orders',     element: <OrdersPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,         element: <Suspense fallback={<AdminFallback />}><AdminDashboardPage /></Suspense> },
      { path: 'menus',       element: <Suspense fallback={<AdminFallback />}><AdminMenuPage /></Suspense> },
      { path: 'categories',  element: <Suspense fallback={<AdminFallback />}><AdminCategoryPage /></Suspense> },
      { path: 'orders',      element: <Suspense fallback={<AdminFallback />}><AdminOrdersPage /></Suspense> },
      { path: 'reports',     element: <Suspense fallback={<AdminFallback />}><AdminReportPage /></Suspense> },
    ],
  },
])
