import React from 'react'
import { motion } from 'framer-motion'
import {
  LayoutGrid, Utensils, GlassWater, Cookie, Coffee, Pizza,
  Sandwich, Salad, IceCream, Soup, Beef, Fish, Egg, ChefHat,
  Apple, Leaf, Flame, Star, Heart, ShoppingBag, Tag,
} from 'lucide-react'

const ICON_MAP = {
  'utensils':    Utensils,
  'glass-water': GlassWater,
  'cookie':      Cookie,
  'coffee':      Coffee,
  'pizza':       Pizza,
  'sandwich':    Sandwich,
  'salad':       Salad,
  'ice-cream':   IceCream,
  'soup':        Soup,
  'beef':        Beef,
  'fish':        Fish,
  'egg':         Egg,
  'chef-hat':    ChefHat,
  'apple':       Apple,
  'leaf':        Leaf,
  'flame':       Flame,
  'star':        Star,
  'heart':       Heart,
  'bag':         ShoppingBag,
  'tag':         Tag,
}

// Fallback: auto-detect from name if no icon_key stored
const CAT_ICONS = [
  { pattern: /makanan|food|meal|makan/i,      Icon: Utensils   },
  { pattern: /minuman|drink|minum|beverage/i, Icon: GlassWater },
  { pattern: /snack|camilan|cemilan/i,        Icon: Cookie     },
  { pattern: /kopi|coffee/i,                  Icon: Coffee     },
  { pattern: /pizza/i,                        Icon: Pizza      },
  { pattern: /sandwich|burger/i,              Icon: Sandwich   },
  { pattern: /salad|sayur/i,                  Icon: Salad      },
  { pattern: /es|ice|cream/i,                 Icon: IceCream   },
  { pattern: /sup|soto|soup/i,                Icon: Soup       },
]
function resolveCategoryIcon(cat) {
  if (cat.icon_key && ICON_MAP[cat.icon_key]) return ICON_MAP[cat.icon_key]
  const match = CAT_ICONS.find(({ pattern }) => pattern.test(cat.name))
  return match ? match.Icon : Tag
}

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
        Icon={LayoutGrid}
        isActive={activeCategory === null}
        onClick={() => onChange(null)}
      />
      {categories.map((cat) => (
        <Tab
          key={cat.id}
          label={cat.name}
          Icon={resolveCategoryIcon(cat)}
          isActive={activeCategory === cat.id}
          onClick={() => onChange(cat.id)}
        />
      ))}
    </div>
  )
}

function Tab({ label, Icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150',
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
      <Icon size={14} className="relative z-10 shrink-0" />
      <span className="relative z-10">{label}</span>
    </button>
  )
}
