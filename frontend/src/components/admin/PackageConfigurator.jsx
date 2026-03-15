import React, { useEffect } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import SelectDropdown from '../ui/SelectDropdown.jsx'
import { formatPrice } from '../../utils/formatPrice.js'

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function getLevels(menu) {
  return Array.isArray(menu?.levels) ? menu.levels : []
}

function getSmallestLevel(levels = []) {
  const normalized = levels
    .map((level) => String(level).trim())
    .filter(Boolean)

  if (normalized.length === 0) return ''

  return [...normalized].sort((a, b) => {
    const numA = Number(a)
    const numB = Number(b)
    const isNumA = !Number.isNaN(numA)
    const isNumB = !Number.isNaN(numB)

    if (isNumA && isNumB) return numA - numB
    if (isNumA) return -1
    if (isNumB) return 1
    return a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' })
  })[0]
}

function createMenuOptions(menus = []) {
  return menus.map((menu) => ({
    value: String(menu.id),
    label: `${menu.name} · ${formatPrice(Number(menu.price || 0))}`,
  }))
}

function createConfiguredItem() {
  return {
    selected_menu_id: null,
    selected_level: '',
    qty: 1,
    sort_order: 0,
  }
}

function normalizeConfiguredItems(value = []) {
  return ensureArray(value)
    .flatMap((rule) => ensureArray(rule?.configured_items))
    .map((item, index) => ({
      ...createConfiguredItem(),
      ...item,
      qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
      sort_order: index,
    }))
}

function buildPackageRules(items = [], menus = []) {
  const normalizedItems = ensureArray(items).map((item, index) => {
    const normalizedLevel =
      item?.selected_level !== undefined && item?.selected_level !== null && String(item.selected_level).trim()
        ? String(item.selected_level).trim()
        : ''

    return {
      ...createConfiguredItem(),
      ...item,
      selected_menu_id: Number(item.selected_menu_id) || null,
      selected_level: normalizedLevel,
      qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
      sort_order: index,
    }
  })

  return [{
    rule_name: 'Isi Paket',
    sort_order: 0,
    configured_items: normalizedItems,
  }]
}

export default function PackageConfigurator({ menuOptions = [], value = [], onChange }) {
  const items = normalizeConfiguredItems(value)
  const availableMenus = menuOptions.filter((menu) => menu.is_package !== true)
  const menuSelectOptions = createMenuOptions(availableMenus)

  function emitChange(nextItems) {
    onChange(buildPackageRules(nextItems, availableMenus))
  }

  function addItem() {
    emitChange([...items, { ...createConfiguredItem(), sort_order: items.length }])
  }

  function updateItem(itemIndex, patch) {
    emitChange(items.map((item, currentIndex) => {
      if (currentIndex !== itemIndex) return item
      return typeof patch === 'function' ? patch(item) : { ...item, ...patch }
    }))
  }

  function removeItem(itemIndex) {
    emitChange(items.filter((_, currentIndex) => currentIndex !== itemIndex))
  }

  useEffect(() => {
    const needsDefaultLevel = items.some((item) => {
      const selectedMenu = availableMenus.find((menu) => menu.id === Number(item.selected_menu_id)) || null
      const levels = getLevels(selectedMenu)
      return levels.length > 0 && !item.selected_level
    })

    if (!needsDefaultLevel) return

    emitChange(items.map((item) => {
      const selectedMenu = availableMenus.find((menu) => menu.id === Number(item.selected_menu_id)) || null
      const levels = getLevels(selectedMenu)
      if (levels.length === 0 || item.selected_level) return item
      return { ...item, selected_level: getSmallestLevel(levels) }
    }))
  }, [value, menuOptions])

  return (
    <div className="space-y-3 rounded-[1.75rem] border border-surface-200 bg-surface-50/80 p-4">
      <div>
        <h3 className="text-lg font-bold text-surface-900">Isi Paket</h3>
        <p className="mt-1 text-sm text-surface-500">Pilih menu yang akan otomatis masuk ke paket ini.</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-dashed border-surface-200 bg-surface-50 p-3">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-700 hover:border-primary-300 hover:text-primary-600 transition-colors"
          >
            <Plus size={14} /> Tambah Item
          </button>
        </div>

        {items.length === 0 && (
          <p className="rounded-xl bg-white px-3 py-3 text-sm text-surface-500">Belum ada item paket. Tambahkan item dari menu yang sudah ada.</p>
        )}

        {items.map((item, itemIndex) => {
          const selectedMenu = availableMenus.find((menu) => menu.id === Number(item.selected_menu_id)) || null
          const selectedMenuLevels = getLevels(selectedMenu)

          return (
            <div key={`package-item-${itemIndex}`} className="rounded-xl border border-surface-200 bg-white p-3 space-y-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
                <div className="space-y-1.5">
                  <span className="block text-sm font-medium text-surface-700">Nama Menu</span>
                  <SelectDropdown
                    options={menuSelectOptions}
                    value={item.selected_menu_id ? String(item.selected_menu_id) : ''}
                    onChange={(value) => {
                      const menuId = Number(value) || null
                      const menuData = availableMenus.find((menu) => menu.id === menuId)
                      const smallestLevel = getSmallestLevel(getLevels(menuData))
                      updateItem(itemIndex, {
                        selected_menu_id: menuData?.id || null,
                        selected_level: smallestLevel,
                      })
                    }}
                    allLabel="Pilih menu"
                    placeholder="Pilih menu"
                    fullWidth
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-sm font-medium text-surface-700">Qty</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if ((item.qty || 1) <= 1) {
                          removeItem(itemIndex)
                          return
                        }
                        updateItem(itemIndex, { qty: Math.max(1, (item.qty || 1) - 1) })
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-surface-700 hover:bg-surface-200 transition-colors"
                      aria-label="Kurangi qty"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-zinc-800 tabular-nums">{item.qty || 1}</span>
                    <button
                      type="button"
                      onClick={() => updateItem(itemIndex, { qty: Math.max(1, (item.qty || 1) + 1) })}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                      aria-label="Tambah qty"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(itemIndex)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>

              {selectedMenuLevels.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-sm font-medium text-surface-700">Level</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMenuLevels.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateItem(itemIndex, { selected_level: level })}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          item.selected_level === level
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-zinc-600 border-surface-200 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedMenu && (
                <div className="rounded-xl bg-surface-50 px-3 py-2 text-xs text-surface-500">
                  {selectedMenu.name} akan masuk ke paket sebanyak {item.qty || 1} porsi.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
