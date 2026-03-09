import React, { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

/**
 * Toast system
 *
 * Usage:
 *   const toast = useToast()
 *   toast.success('Berhasil!')
 *   toast.error('Terjadi kesalahan')
 *   toast.info('Info message')
 */

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle2 size={18} className="text-green-500 shrink-0" />,
  error:   <XCircle     size={18} className="text-red-500   shrink-0" />,
  info:    <Info        size={18} className="text-blue-500  shrink-0" />,
  warning: <AlertTriangle size={18} className="text-yellow-500 shrink-0" />,
}

const bgMap = {
  success: 'bg-green-50  border-green-200',
  error:   'bg-red-50    border-red-200',
  info:    'bg-blue-50   border-blue-200',
  warning: 'bg-yellow-50 border-yellow-200',
}

let toastId = 0

function ToastItem({ toast, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,   scale: 1 }}
      exit={{   opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={[
        'flex items-start gap-3 p-4 rounded-2xl border shadow-medium',
        'w-[90vw] max-w-sm',
        bgMap[toast.type] || bgMap.info,
      ].join(' ')}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-zinc-700">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-zinc-400 hover:text-zinc-600 transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const ctx = {
    success: (msg, dur) => add(msg, 'success', dur),
    error:   (msg, dur) => add(msg, 'error',   dur),
    info:    (msg, dur) => add(msg, 'info',     dur),
    warning: (msg, dur) => add(msg, 'warning',  dur),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="fixed top-4 right-4 z-[100] flex flex-col gap-2 items-end"
        >
          <AnimatePresence mode="popLayout">
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onRemove={remove} />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

/** Hook – use inside ToastProvider */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

/**
 * Toaster – drop-in root component that wraps the app.
 * Used in App.jsx: <Toaster />
 * (We wrap via a standalone component so App doesn't need to import *Provider*)
 */
export function Toaster({ children }) {
  // This component is mounted close to the DOM root.
  // It provides both the context and the portal-rendered list.
  return <ToastProvider>{children}</ToastProvider>
}

export default ToastProvider
