import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/layout/Container.jsx'
import CategoryTabs from '../components/menu/CategoryTabs.jsx'
import MenuGrid from '../components/menu/MenuGrid.jsx'
import CartDrawer from '../components/cart/CartDrawer.jsx'
import Button from '../components/ui/Button.jsx'
import { ShoppingCart } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice.js'
import useCartStore from '../store/cartStore.js'
import useFetch from '../hooks/useFetch.js'
import api from '../services/api.js'

/**
 * MenuPage – main food ordering page.
 * Shows category tabs + menu grid, floating cart button at bottom.
 */
export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(null)

  // Fetch categories
  const { data: catData, loading: catLoading } = useFetch(
    () => api.get('/categories'),
    []
  )

  // Fetch menus (re-fetch when category changes)
  const { data: menuData, loading: menuLoading } = useFetch(
    () => {
      const params = new URLSearchParams({ limit: '100' })
      if (activeCategory) {
        params.set('category_id', activeCategory)
      }
      const url = `/menus?${params.toString()}`
      return api.get(url)
    },
    [activeCategory]
  )

  const categories = catData?.data || []
  const menus      = menuData?.data || []

  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const total     = useCartStore((s) => s.total)
  const openCart  = useCartStore((s) => s.openCart)

  return (
    <>
      <Container>
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-5"
        >
          <p className="text-sm text-zinc-500">Selamat datang 👋</p>
          <h1 className="text-2xl font-extrabold text-zinc-900 mt-0.5">
            Mau makan apa hari ini?
          </h1>
        </motion.div>

        {/* Category tabs */}
        <div className="mb-4">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Menu grid */}
        <MenuGrid
          menus={menus}
          categories={categories}
          activeCategory={activeCategory}
          loading={menuLoading || catLoading}
        />
      </Container>

      {/* Sticky floating cart button */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-4"
        >
          <button
            onClick={openCart}
            className="flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-strong px-5 py-3.5 transition-all active:scale-95 w-full max-w-sm"
          >
            <span className="bg-white/20 rounded-xl p-1.5">
              <ShoppingCart size={18} />
            </span>
            <span className="flex-1 text-left font-semibold text-sm">
              {itemCount} item dipilih
            </span>
            <span className="font-bold text-sm">{formatPrice(total)}</span>
          </button>
        </motion.div>
      )}

      {/* Cart drawer (portal) */}
      <CartDrawer />
    </>
  )
}
