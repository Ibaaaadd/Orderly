import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ChevronDown } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice.js'
import { formatPackageSelectionLine } from '../../utils/packageSelections.js'
import useCartStore from '../../store/cartStore.js'

/**
 * CartItem – single row inside the cart drawer.
 * Shows food name, editable level badge (if any), price, quantity controls, and remove button.
 */
export default function CartItem({ item }) {
  const addItem      = useCartStore((s) => s.addItem)
  const decreaseItem = useCartStore((s) => s.decreaseItem)
  const removeItem   = useCartStore((s) => s.removeItem)
  const changeLevel  = useCartStore((s) => s.changeLevel)

  const [showLevelPicker, setShowLevelPicker] = useState(false)
  const hasLevels = Array.isArray(item.levels) && item.levels.length > 0
  const packageSelections = Array.isArray(item.package_selections) ? item.package_selections : []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="py-3.5 border-b border-surface-100 last:border-0"
    >
      <div className="flex items-center gap-3">
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

        {/* Name + level badge + subtotal */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-800 truncate">{item.name}</p>
          {packageSelections.length > 0 && (
            <div className="mt-1 space-y-1">
              {packageSelections.slice(0, 3).map((entry, index) => (
                <p key={`${item.cartKey}-package-${index}`} className="text-[11px] text-zinc-500 leading-4">
                  {formatPackageSelectionLine(entry)}
                </p>
              ))}
              {packageSelections.length > 3 && (
                <p className="text-[11px] font-medium text-zinc-400">
                  +{packageSelections.length - 3} pilihan lain
                </p>
              )}
            </div>
          )}
          {hasLevels && (
            <button
              onClick={() => setShowLevelPicker((v) => !v)}
              className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-md mt-0.5 hover:bg-orange-200 transition-colors"
              aria-label="Ganti level"
            >
              🌶️ {item.level || 'Pilih level'}
              <ChevronDown size={10} className={`transition-transform ${showLevelPicker ? 'rotate-180' : ''}`} />
            </button>
          )}
          {!hasLevels && item.level && (
            <span className="inline-block text-xs bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-md mt-0.5">
              🌶️ {item.level}
            </span>
          )}
          <p className="text-xs text-primary-600 font-bold mt-0.5">
            {formatPrice(item.subtotal)}
          </p>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => decreaseItem(item.cartKey)}
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
          onClick={() => removeItem(item.cartKey)}
          className="w-7 h-7 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
          aria-label={`Hapus ${item.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Inline level picker */}
      <AnimatePresence>
        {showLevelPicker && hasLevels && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 pt-2 pl-14">
              {item.levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    changeLevel(item.cartKey, lvl)
                    setShowLevelPicker(false)
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    item.level === lvl
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-zinc-600 border-surface-200 hover:border-orange-400 hover:bg-orange-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

