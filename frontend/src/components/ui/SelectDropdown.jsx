import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

/**
 * SelectDropdown — searchable single-select dropdown with optional icons.
 *
 * Props:
 *  options      – Array<{ value: string|number, label: string, icon?: ReactNode }>
 *  value        – current selected value ('' = none / "All")
 *  onChange     – (value) => void
 *  allLabel     – label for the "All / reset" option (default: 'Semua')
 *  allIcon      – ReactNode icon for the all option
 *  placeholder  – trigger button placeholder text
 *  className    – extra class on the trigger
 *  searchable   – show search input inside dropdown (default: true)
 */
export default function SelectDropdown({
  options = [],
  value = '',
  onChange,
  allLabel = 'Semua',
  allIcon,
  placeholder,
  className = '',
  searchable = true,
}) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const containerRef          = useRef(null)
  const searchRef             = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Auto-focus search when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  const allOption  = { value: '', label: allLabel, icon: allIcon }
  const allOptions = [allOption, ...options]

  const selected   = allOptions.find((o) => String(o.value) === String(value)) ?? allOption

  const filtered   = searchable && query.trim()
    ? allOptions.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : allOptions

  function pick(val) {
    onChange?.(val)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all select-none',
          value
            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
            : 'bg-white text-surface-700 border-surface-200 hover:border-surface-300 hover:bg-surface-50',
        ].join(' ')}
      >
        {selected.icon && (
          <span className={value ? 'text-white' : 'text-surface-400'}>
            {selected.icon}
          </span>
        )}
        <span>{placeholder && !value ? placeholder : selected.label}</span>
        <ChevronDown
          size={13}
          className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''} ${value ? 'text-white/70' : 'text-surface-400'}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white border border-surface-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-surface-100">
              <div className="relative flex items-center">
                <Search size={13} className="absolute left-2.5 text-surface-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari kategori…"
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-surface-200 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 placeholder:text-surface-400"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-xs text-surface-400 text-center">Tidak ditemukan</li>
            )}
            {filtered.map((opt) => {
              const isSelected = String(opt.value) === String(value)
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => pick(opt.value)}
                    className={[
                      'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                      isSelected
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-surface-700 hover:bg-surface-50',
                    ].join(' ')}
                  >
                    {opt.icon && (
                      <span className={isSelected ? 'text-primary-500' : 'text-surface-400'}>
                        {opt.icon}
                      </span>
                    )}
                    <span className="flex-1 truncate">{opt.label}</span>
                    {isSelected && <Check size={13} className="text-primary-500 shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
