import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MenuCard from './MenuCard.jsx'
import { MenuCardSkeleton } from '../ui/Loader.jsx'
import { UtensilsCrossed } from 'lucide-react'

/**
 * MenuGrid – responsive 2-column grid of menu cards.
 *
 * Props:
 *  menus   – array of menu objects
 *  loading – boolean skeleton state
 */
export default function MenuGrid({ menus = [], loading = false }) {
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

  return (
    <motion.div
      layout
      className="grid grid-cols-2 gap-3"
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
