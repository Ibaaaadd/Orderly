import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice.js'
import useCartStore from '../../store/cartStore.js'

/**
 * MenuCard – displays a single menu item.
 * If the menu has levels configured, tapping opens a level picker
 * before the item is added to cart.
 */
export default function MenuCard({ menu }) {
  const addItem = useCartStore((s) => s.addItem)
  // Sum qty across all levels of this menu
  const qty = useCartStore((s) =>
    s.items.filter((i) => i.id === menu.id).reduce((sum, i) => sum + i.qty, 0)
  )

  const [showPicker, setShowPicker] = useState(false)

  const hasLevels = Array.isArray(menu.levels) && menu.levels.length > 0
  const packageRules = Array.isArray(menu.package_rules) ? menu.package_rules : []
  const isPackageMenu = menu.is_package === true || String(menu.category_name || '').toLowerCase() === 'paket'
  const packagePreview = packageRules
    .flatMap((rule) => Array.isArray(rule.configured_items) ? rule.configured_items : [])
    .slice(0, 2)
    .map((item) => item.selected_menu_name || item.custom_input_name)
    .filter(Boolean)

  const handleAdd = (e) => {
    e.stopPropagation()
    if (!menu.is_available) return
    if (hasLevels) {
      setShowPicker(true)
    } else {
      addItem(menu)
    }
  }

  const handleSelectLevel = (level) => {
    addItem({ ...menu, level })
    setShowPicker(false)
  }


  return (
    <>
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

          {/* Level indicator badge */}
          {hasLevels && (
            <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              🌶️ Level
            </span>
          )}

          {isPackageMenu && (
            <span className="absolute bottom-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              Paket Admin
            </span>
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
          {isPackageMenu && (
            <p className="mt-1 min-h-[2rem] text-[11px] leading-4 text-zinc-500">
              {packagePreview.length > 0
                ? `Isi paket: ${packagePreview.join(', ')}${packageRules.flatMap((rule) => Array.isArray(rule.configured_items) ? rule.configured_items : []).length > 2 ? ', ...' : ''}`
                : 'Isi paket ditentukan admin.'}
            </p>
          )}
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

      {/* Level picker modal */}
      {hasLevels && showPicker && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPicker(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            className="relative bg-white rounded-3xl shadow-strong w-full max-w-xs m-4 p-5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-zinc-800">{menu.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">Pilih level kepedasan</p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1.5 rounded-lg hover:bg-surface-100 text-zinc-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {menu.levels.map((level) => (
                <button
                  key={level}
                  onClick={() => handleSelectLevel(level)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-surface-200 hover:border-primary-400 hover:bg-primary-50 transition-colors font-medium text-sm text-zinc-700"
                >
                  {level}
                </button>
              ))}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  )
}

