import React from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice.js'
import useCartStore from '../../store/cartStore.js'

/**
 * CartItem – single row inside the cart drawer.
 * Shows food name, price, quantity controls, and remove button.
 */
export default function CartItem({ item }) {
  const addItem      = useCartStore((s) => s.addItem)
  const decreaseItem = useCartStore((s) => s.decreaseItem)
  const removeItem   = useCartStore((s) => s.removeItem)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 py-3.5 border-b border-surface-100 last:border-0"
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-100 shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
        )}
      </div>

      {/* Name + subtotal */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 truncate">{item.name}</p>
        <p className="text-xs text-primary-600 font-bold mt-0.5">
          {formatPrice(item.subtotal)}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => decreaseItem(item.id)}
          className="w-7 h-7 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center transition-colors"
          aria-label="Kurangi"
        >
          <Minus size={13} />
        </button>

        <span className="w-6 text-center text-sm font-bold text-zinc-800 tabular-nums">
          {item.qty}
        </span>

        <button
          onClick={() => addItem(item)}
          className="w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
          aria-label="Tambah"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Remove button */}
      <button
        onClick={() => removeItem(item.id)}
        className="w-7 h-7 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
        aria-label={`Hapus ${item.name}`}
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  )
}
