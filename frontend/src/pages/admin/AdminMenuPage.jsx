import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, ImageIcon, Tag, DollarSign, Flame, ChevronDown, Utensils, GlassWater, Cookie, Coffee, Pizza, Sandwich, Salad, IceCream, Soup, LayoutGrid, Link, Upload } from 'lucide-react'

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

const EMPTY_FORM = {
  name: '',
  category_id: '',
  price: '',
  image_url: '',
  is_available: true,
  levels: [],
}

export default function AdminMenuPage() {
  const [menus, setMenus]           = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [newLevelInput, setNewLevelInput] = useState('')
  const [filterCat, setFilterCat]   = useState('')
  const [imgMode, setImgMode]       = useState('url')  // 'url' | 'upload'
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
    setEditing(null)
    setForm(EMPTY_FORM)
    setNewLevelInput('')
    setFormError('')
    setImgMode('url')
    setShowModal(true)
  }

  function openEdit(menu) {
    setEditing(menu)
    setForm({
      name:         menu.name,
      category_id:  menu.category_id ?? '',
      price:        String(menu.price),
      image_url:    menu.image_url ?? '',
      is_available: menu.is_available,
      levels:       Array.isArray(menu.levels) ? [...menu.levels] : [],
    })
    setNewLevelInput('')
    setImgMode('url')
    setFormError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim()) { setFormError('Nama menu wajib diisi'); return }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError('Harga tidak valid'); return
    }
    const payload = {
      name:         form.name.trim(),
      category_id:  form.category_id ? Number(form.category_id) : null,
      price:        Number(form.price),
      image_url:    form.image_url.trim() || null,
      is_available: form.is_available,
      levels:       form.levels,
    }
    try {
      setSaving(true)
      if (editing) {
        await adminService.updateMenu(editing.id, payload)
        toast('Menu berhasil diperbarui')
      } else {
        await adminService.createMenu(payload)
        toast('Menu berhasil ditambahkan')
      }
      setShowModal(false)
      load()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
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
        <h1 className="text-2xl font-bold text-surface-800">Kelola Menu</h1>
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />

            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div>
                  <p className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-0.5">
                    {editing ? 'Edit Data' : 'Data Baru'}
                  </p>
                  <h2 className="text-xl font-bold text-surface-900">
                    {editing ? 'Edit Menu' : 'Tambah Menu'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="px-6 pb-6 space-y-5 max-h-[65vh] overflow-y-auto">
                  {formError && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
                      <X size={15} className="shrink-0 mt-0.5" />
                      {formError}
                    </div>
                  )}

                  {/* Nama + Kategori */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">
                        Nama Menu <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full border border-surface-200 bg-surface-50 rounded-2xl px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-colors"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="cth. Nasi Goreng Spesial"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">
                        <span className="inline-flex items-center gap-1"><Tag size={11} />Kategori</span>
                      </label>
                      <div className="relative">
                        <select
                          className="w-full appearance-none border border-surface-200 bg-surface-50 rounded-2xl px-4 py-2.5 pr-9 text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-colors cursor-pointer"
                          value={form.category_id}
                          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        >
                          <option value="">Tanpa Kategori</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">
                        <span className="inline-flex items-center gap-1"><DollarSign size={11} />Harga (Rp) <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full border border-surface-200 bg-surface-50 rounded-2xl px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-colors"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Gambar: URL atau Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">
                      <span className="inline-flex items-center gap-1"><ImageIcon size={11} />Gambar</span>
                    </label>

                    {/* Mode tabs */}
                    <div className="flex gap-1 p-1 bg-surface-100 rounded-xl mb-2.5 w-fit">
                      <button
                        type="button"
                        onClick={() => { setImgMode('url'); setForm({ ...form, image_url: '' }) }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          imgMode === 'url' ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                        }`}
                      >
                        <Link size={11} /> URL
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImgMode('upload'); setForm({ ...form, image_url: '' }) }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          imgMode === 'upload' ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                        }`}
                      >
                        <Upload size={11} /> Upload
                      </button>
                    </div>

                    <div className="flex gap-3 items-start">
                      {imgMode === 'url' ? (
                        <input
                          className="flex-1 border border-surface-200 bg-surface-50 rounded-2xl px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-colors"
                          value={form.image_url}
                          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                          placeholder="https://..."
                        />
                      ) : (
                        <label className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-surface-200 bg-surface-50 rounded-2xl px-4 py-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                          <Upload size={18} className="text-surface-400" />
                          <span className="text-xs text-surface-500 font-medium">Klik untuk pilih gambar</span>
                          <span className="text-[10px] text-surface-400">JPG, PNG, WebP — maks 2 MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              if (file.size > 2 * 1024 * 1024) {
                                setFormError('Ukuran gambar maks 2 MB'); return
                              }
                              const reader = new FileReader()
                              reader.onload = () => setForm((f) => ({ ...f, image_url: reader.result }))
                              reader.readAsDataURL(file)
                            }}
                          />
                        </label>
                      )}

                      {/* Preview */}
                      {form.image_url ? (
                        <div className="relative shrink-0">
                          <img
                            src={form.image_url}
                            alt="preview"
                            className="w-14 h-14 rounded-2xl object-cover border border-surface-200"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image_url: '' })}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center shrink-0">
                          <ImageIcon size={20} className="text-surface-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toggle tersedia */}
                  <div
                    className="flex items-center justify-between p-4 rounded-2xl border border-surface-200 bg-surface-50 cursor-pointer select-none"
                    onClick={() => setForm({ ...form, is_available: !form.is_available })}
                  >
                    <div>
                      <p className="text-sm font-semibold text-surface-800">Menu Tersedia</p>
                      <p className="text-xs text-surface-400 mt-0.5">Tampilkan menu ini ke pelanggan</p>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.is_available ? 'bg-primary-500' : 'bg-surface-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.is_available ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Opsi Level */}
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">
                      <span className="inline-flex items-center gap-1"><Flame size={11} />Opsi Level <span className="font-normal normal-case text-surface-400">(opsional)</span></span>
                    </label>
                    {form.levels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {form.levels.map((lvl, i) => (
                          <span key={i} className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                            {lvl}
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, levels: form.levels.filter((_, j) => j !== i) })}
                              className="text-orange-400 hover:text-orange-700 transition-colors leading-none"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-surface-200 bg-surface-50 rounded-2xl px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-colors"
                        value={newLevelInput}
                        onChange={(e) => setNewLevelInput(e.target.value)}
                        placeholder="cth. Pedas, Level 2, Extra Hot…"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = newLevelInput.trim()
                            if (val && !form.levels.includes(val)) {
                              setForm({ ...form, levels: [...form.levels, val] })
                              setNewLevelInput('')
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = newLevelInput.trim()
                          if (val && !form.levels.includes(val)) {
                            setForm({ ...form, levels: [...form.levels, val] })
                            setNewLevelInput('')
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors shrink-0"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 bg-surface-50 border-t border-surface-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-surface-200 text-surface-700 px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-white transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 shadow-sm shadow-primary-200"
                  >
                    {saving ? 'Menyimpan…' : editing ? 'Simpan Perubahan' : 'Tambah Menu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
