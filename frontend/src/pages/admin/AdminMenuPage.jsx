import React, { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, ImageIcon, Tag, Utensils, GlassWater, Cookie, Coffee, Pizza, Sandwich, Salad, IceCream, Soup, LayoutGrid, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CAT_ICONS = [
  { pattern: /makanan|food|meal|makan/i,      Icon: Utensils },
  { pattern: /minuman|drink|minum|beverage/i,  Icon: GlassWater },
  { pattern: /snack|camilan|cemilan/i,         Icon: Cookie },
  { pattern: /kopi|coffee/i,                   Icon: Coffee },
  { pattern: /pizza/i,                         Icon: Pizza },
  { pattern: /sandwich|burger/i,               Icon: Sandwich },
  { pattern: /salad|sayur/i,                   Icon: Salad },
  { pattern: /es|ice|cream/i,                  Icon: IceCream },
  { pattern: /sup|soto|soup/i,                 Icon: Soup },
]
function getCategoryIcon(name) {
  const match = CAT_ICONS.find(({ pattern }) => pattern.test(name))
  return match ? match.Icon : Tag
}
import * as adminService from '../../services/adminService'
import { formatPrice } from '../../utils/formatPrice'
import { confirmDelete, toast, showError } from '../../utils/swal'
import DataTable from '../../components/ui/DataTable'
import SelectDropdown from '../../components/ui/SelectDropdown'

export default function AdminMenuPage() {
  const navigate = useNavigate()
  const [menus, setMenus]           = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [filterCat, setFilterCat]   = useState('')
  const [previewImg, setPreviewImg] = useState(null)   // { url, name }
  const [page, setPage]             = useState(1)
  const [pageSize, setPageSize]     = useState(10)
  const [search, setSearch]         = useState('')
  const [total, setTotal]           = useState(0)

  // Load categories once
  const loadCategories = useCallback(async () => {
    try {
      const res = await adminService.getCategories()
      setCategories(res.data)
    } catch {}
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await adminService.getMenus({
        page,
        limit: pageSize,
        ...(search     ? { search }               : {}),
        ...(filterCat  ? { category_id: filterCat } : {}),
      })
      setMenus(res.data)
      setTotal(res.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, filterCat])

  useEffect(() => { loadCategories() }, [loadCategories])
  useEffect(() => { load() }, [load])

  function openCreate() {
    navigate('/admin/menus/new')
  }

  function openEdit(menu) {
    navigate(`/admin/menus/${menu.id}/edit`)
  }

  async function handleDelete(id) {
    const result = await confirmDelete('Hapus menu ini?')
    if (!result.isConfirmed) return
    setDeletingId(id)
    try {
      await adminService.deleteMenu(id)
      toast('Menu berhasil dihapus')
      load()
    } catch (e) {
      showError('Gagal', e.message)
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      key: 'name', label: 'Nama',
      className: 'font-medium text-surface-800',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image_url ? (
            <button
              type="button"
              onClick={() => setPreviewImg({ url: row.image_url, name: row.name })}
              className="shrink-0 w-10 h-10 rounded-lg overflow-hidden ring-2 ring-transparent hover:ring-primary-400 transition-all focus:outline-none focus:ring-primary-400"
              title="Lihat foto"
            >
              <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
            </button>
          ) : (
            <div className="shrink-0 w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
              <ImageIcon size={16} className="text-surface-300" />
            </div>
          )}
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: 'category_name', label: 'Kategori',
      className: 'text-surface-500',
      render: (row) => row.category_name || '—',
    },
    {
      key: 'price', label: 'Harga',
      headerClassName: 'text-right',
      className: 'text-right font-semibold text-surface-800 whitespace-nowrap',
      render: (row) => formatPrice(Number(row.price)),
    },
    {
      key: 'is_available', label: 'Tersedia',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (row) => row.is_available
        ? <Check size={16} className="text-green-500 mx-auto" />
        : <X size={16} className="text-red-400 mx-auto" />,
    },
    {
      key: 'levels', label: 'Level',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (row) => {
        const lvls = Array.isArray(row.levels) ? row.levels : []
        return lvls.length > 0
          ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
              <Flame size={10} /> {lvls.length}
            </span>
          )
          : <span className="text-surface-300 text-xs">—</span>
      },
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Kelola Menu</h1>
          <p className="mt-1 text-sm text-surface-500">Buka halaman form penuh untuk tambah atau edit menu dan paket.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Tambah Menu
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={menus}
        loading={loading}
        serverSide
        serverTotal={total}
        serverPage={page}
        onServerPageChange={setPage}
        onServerPageSizeChange={setPageSize}
        onServerSearch={setSearch}
        searchKeys={['name']}
        emptyText="Belum ada menu"
        toolbar={
          <SelectDropdown
            options={categories.map((c) => ({
              value: String(c.id),
              label: c.name,
              icon:  <>{React.createElement(getCategoryIcon(c.name), { size: 13 })}</>,
            }))}
            value={filterCat}
            onChange={(val) => { setFilterCat(val); setPage(1) }}
            allLabel="Semua Kategori"
            allIcon={<LayoutGrid size={13} />}
            placeholder="Filter Kategori"
          />
        }
        actions={(menu) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => openEdit(menu)}
              className="p-1.5 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit menu"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(menu.id)}
              disabled={deletingId === menu.id}
              className="p-1.5 text-surface-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* ── Image lightbox ───────────────────────────────────────── */}
      <AnimatePresence>
        {previewImg && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setPreviewImg(null)}
          >
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

            {/* panel */}
            <motion.div
              className="relative z-10 max-w-lg w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImg.url}
                alt={previewImg.name}
                className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
              <p className="mt-3 text-center text-white/80 text-sm font-medium">{previewImg.name}</p>
              <button
                onClick={() => setPreviewImg(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white text-surface-700 rounded-full flex items-center justify-center shadow-lg hover:bg-surface-100 transition-colors"
              >
                <X size={15} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
