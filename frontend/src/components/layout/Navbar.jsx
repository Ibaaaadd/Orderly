import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, ChefHat, ClipboardList, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useCartStore from '../../store/cartStore.js'

/**
 * Navbar – top navigation bar with cart badge.
 * Sticky on scroll, semi-transparent blur background.
 */
export default function Navbar() {
  const { pathname } = useLocation()
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const openCart  = useCartStore((s) => s.openCart)

  // Hide cart icon on cart / payment pages
  const hideCartBtn = ['/cart'].some((p) => pathname.startsWith(p))

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-surface-100 shadow-soft">
      <nav className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold text-xl text-zinc-900 tracking-tight"
        >
          <span className="bg-primary-500 text-white rounded-xl p-1.5">
            <ChefHat size={18} />
          </span>
          Orderly
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Order history */}
          <Link
            to="/orders"
            className={[
              'p-2 rounded-xl transition-colors',
              pathname === '/orders'
                ? 'bg-primary-50 text-primary-600'
                : 'text-zinc-500 hover:bg-surface-100 hover:text-zinc-700',
            ].join(' ')}
            aria-label="Riwayat pesanan"
          >
            <ClipboardList size={20} />
          </Link>

          {/* Admin panel */}
          <Link
            to="/admin"
            className={[
              'p-2 rounded-xl transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-primary-50 text-primary-600'
                : 'text-zinc-500 hover:bg-surface-100 hover:text-zinc-700',
            ].join(' ')}
            aria-label="Admin panel"
          >
            <LayoutDashboard size={20} />
          </Link>

          {/* Cart icon with badge */}
          {!hideCartBtn && (
            <button
              onClick={openCart}
              className="relative p-2 rounded-xl text-zinc-500 hover:bg-surface-100 hover:text-zinc-700 transition-colors"
              aria-label={`Keranjang (${itemCount} item)`}
            >
              <ShoppingCart size={20} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}
