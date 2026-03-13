import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MenuCard from './MenuCard.jsx'
import { MenuCardSkeleton } from '../ui/Loader.jsx'
import { Dot, LayoutGrid, UtensilsCrossed } from 'lucide-react'

/**
 * MenuGrid – responsive 2-column grid of menu cards.
 *
 * Props:
 *  menus   – array of menu objects
 *  categories – array of category objects for grouping order
 *  activeCategory – currently selected category id
 *  loading – boolean skeleton state
 */
export default function MenuGrid({
  menus = [],
  categories = [],
  activeCategory = null,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MenuCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!menus.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <UtensilsCrossed size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Menu tidak ditemukan</p>
        <p className="text-sm mt-1">Coba kategori lain</p>
      </div>
    )
  }

  const showGroupedSections = activeCategory === null

  if (showGroupedSections) {
    const categoryOrder = new Map(categories.map((category, index) => [category.id, index]))
    const groupedMenus = menus.reduce((acc, menu) => {
      const key = menu.category_id ?? `uncategorized-${menu.id}`
      const existingGroup = acc.get(key)

      if (existingGroup) {
        existingGroup.items.push(menu)
        return acc
      }

      acc.set(key, {
        id: menu.category_id ?? key,
        name: menu.category_name || 'Lainnya',
        items: [menu],
        order: categoryOrder.get(menu.category_id) ?? Number.MAX_SAFE_INTEGER,
      })
      return acc
    }, new Map())

    const sections = Array.from(groupedMenus.values()).sort((left, right) => {
      if (left.order !== right.order) return left.order - right.order
      return left.name.localeCompare(right.name, 'id')
    })

    return (
      <div className="space-y-6 pb-24">
        {sections.map((section, sectionIndex) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.06, duration: 0.28 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between rounded-2xl border border-surface-200 bg-white/90 px-4 py-3 shadow-soft backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <LayoutGrid size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">{section.name}</h2>
                  <p className="text-xs text-zinc-500">Pilihan menu dalam kategori ini</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                <Dot size={14} className="text-primary-500" />
                {section.items.length} menu
              </span>
            </div>

            <motion.div layout className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {section.items.map((menu, itemIndex) => (
                  <motion.div
                    key={menu.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: itemIndex * 0.03, duration: 0.25 }}
                  >
                    <MenuCard menu={menu} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.section>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-2 gap-3 pb-24"
    >
      <AnimatePresence>
        {menus.map((menu, i) => (
          <motion.div
            key={menu.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <MenuCard menu={menu} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
