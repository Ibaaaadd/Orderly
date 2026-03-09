import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { ToastProvider } from '../components/ui/Toast.jsx'

/**
 * Root App component — provides router and global UI layer (toasts).
 */
export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}
