import React from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice.js'
import useCartStore from '../../store/cartStore.js'

/**
 * MenuCard – displays a single menu item with image, name, price, and add button.
 * Tapping the card or the + button adds the item to cart.
 */
export default function MenuCard({ menu }) {
  const addItem = useCartStore((s) => s.addItem)
  // Read qty for this item to show in badge
  const qty = useCartStore((s) => {
    const found = s.items.find((i) => i.id === menu.id)
    return found ? found.qty : 0
  })

  const handleAdd = (e) => {
    e.stopPropagation()
    addItem(menu)
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden cursor-pointer"
      onClick={handleAdd}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-44 bg-surface-100 overflow-hidden">
        {menu.image_url ? (
          <img
            src={menu.image_url}
            alt={menu.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary-50 to-primary-100">
            🍽️
          </div>
        )}

        {/* Cart qty badge */}
        {qty > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow"
          >
            {qty}
          </motion.span>
        )}

        {/* Unavailable overlay */}
        {!menu.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-zinc-800 truncate">{menu.name}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-primary-600 font-bold text-sm">
            {formatPrice(menu.price)}
          </span>

          {menu.is_available && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleAdd}
              className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-soft transition-colors"
              aria-label={`Tambah ${menu.name} ke keranjang`}
            >
              <Plus size={16} strokeWidth={2.5} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
