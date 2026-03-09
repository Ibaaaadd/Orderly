import React from 'react'
import { motion } from 'framer-motion'

/**
 * CategoryTabs – horizontal scrollable tab bar for menu categories.
 *
 * Props:
 *  categories     – Array<{ id, name }>
 *  activeCategory – currently selected category id
 *  onChange       – (id) => void
 */
export default function CategoryTabs({ categories = [], activeCategory, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {/* "All" tab */}
      <Tab
        label="Semua"
        isActive={activeCategory === null}
        onClick={() => onChange(null)}
      />
      {categories.map((cat) => (
        <Tab
          key={cat.id}
          label={cat.name}
          isActive={activeCategory === cat.id}
          onClick={() => onChange(cat.id)}
        />
      ))}
    </div>
  )
}

function Tab({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        isActive
          ? 'text-white'
          : 'bg-surface-100 text-zinc-500 hover:bg-surface-200 hover:text-zinc-700',
      ].join(' ')}
    >
      {/* Animated background pill */}
      {isActive && (
        <motion.span
          layoutId="category-pill"
          className="absolute inset-0 bg-primary-500 rounded-xl z-0"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}
