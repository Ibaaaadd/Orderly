import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import Container from '../components/layout/Container.jsx'
import MenuPage from '../pages/MenuPage.jsx'
import CartPage from '../pages/CartPage.jsx'
import PaymentPage from '../pages/PaymentPage.jsx'
import SuccessPage from '../pages/SuccessPage.jsx'
import OrdersPage from '../pages/OrdersPage.jsx'
import AdminMenuPage from '../pages/admin/AdminMenuPage.jsx'
import AdminCategoryPage from '../pages/admin/AdminCategoryPage.jsx'
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.jsx'

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
import { Outlet, Navigate } from 'react-router-dom'

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
      { index: true,              element: <Navigate to="/admin/menus" replace /> },
      { path: 'menus',       element: <AdminMenuPage /> },
      { path: 'categories',  element: <AdminCategoryPage /> },
      { path: 'orders',      element: <AdminOrdersPage /> },
    ],
  },
])
