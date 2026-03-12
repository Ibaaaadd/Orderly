import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Tag, Info,
  Utensils, GlassWater, Cookie, Coffee, Pizza,
  Sandwich, Salad, IceCream, Soup,
  Beef, Fish, Egg, ChefHat, Apple, Leaf,
  Flame, Star, Heart, ShoppingBag,
  FolderOpen, CheckCircle2,
} from 'lucide-react'
import * as adminService from '../../services/adminService'
import { confirmDelete, toast, showError } from '../../utils/swal'
import Modal  from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input  from '../../components/ui/Input'

/* ─── Icon catalogue shown in picker ─────────────────────────────────── */
const ICON_OPTIONS = [
  { key: 'utensils',    Icon: Utensils,    label: 'Makanan'  },
  { key: 'glass-water', Icon: GlassWater,  label: 'Minuman'  },
  { key: 'cookie',      Icon: Cookie,      label: 'Snack'    },
  { key: 'coffee',      Icon: Coffee,      label: 'Kopi'     },
  { key: 'pizza',       Icon: Pizza,       label: 'Pizza'    },
  { key: 'sandwich',    Icon: Sandwich,    label: 'Burger'   },
  { key: 'salad',       Icon: Salad,       label: 'Salad'    },
  { key: 'ice-cream',   Icon: IceCream,    label: 'Es Krim'  },
  { key: 'soup',        Icon: Soup,        label: 'Sup'      },
  { key: 'beef',        Icon: Beef,        label: 'Daging'   },
  { key: 'fish',        Icon: Fish,        label: 'Seafood'  },
  { key: 'egg',         Icon: Egg,         label: 'Sarapan'  },
  { key: 'chef-hat',    Icon: ChefHat,     label: 'Masakan'  },
  { key: 'apple',       Icon: Apple,       label: 'Buah'     },
  { key: 'leaf',        Icon: Leaf,        label: 'Sehat'    },
  { key: 'flame',       Icon: Flame,       label: 'Pedas'    },
  { key: 'star',        Icon: Star,        label: 'Spesial'  },
  { key: 'heart',       Icon: Heart,       label: 'Favorit'  },
  { key: 'bag',         Icon: ShoppingBag, label: 'Paket'    },
  { key: 'tag',         Icon: Tag,         label: 'Lainnya'  },
]

/* ─── Colour palette ─────────────────────────────────────────────────── */
const COLOR_OPTIONS = [
  { key: 'primary', bg: 'bg-primary-50', text: 'text-primary-500', dot: 'bg-primary-500'  },
  { key: 'amber',   bg: 'bg-amber-50',   text: 'text-amber-500',   dot: 'bg-amber-400'    },
  { key: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-500', dot: 'bg-emerald-500'  },
  { key: 'violet',  bg: 'bg-violet-50',  text: 'text-violet-500',  dot: 'bg-violet-500'   },
  { key: 'rose',    bg: 'bg-rose-50',    text: 'text-rose-500',    dot: 'bg-rose-500'     },
  { key: 'sky',     bg: 'bg-sky-50',     text: 'text-sky-500',     dot: 'bg-sky-500'      },
  { key: 'pink',    bg: 'bg-pink-50',    text: 'text-pink-500',    dot: 'bg-pink-500'     },
  { key: 'orange',  bg: 'bg-orange-50',  text: 'text-orange-500',  dot: 'bg-orange-400'   },
]

function getIconComponent(key) {
  return ICON_OPTIONS.find((o) => o.key === key)?.Icon ?? Tag
}
function getColor(key) {
  return COLOR_OPTIONS.find((c) => c.key === key) ?? COLOR_OPTIONS[0]
}

/* ─── Skeleton card ──────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 animate-pulse flex flex-col gap-3">
      <div className="w-12 h-12 rounded-xl bg-surface-100" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-24 rounded-full bg-surface-100" />
        <div className="h-2.5 w-12 rounded-full bg-surface-100" />
      </div>
      <div className="flex gap-2 mt-1">
        <div className="flex-1 h-7 rounded-lg bg-surface-100" />
        <div className="flex-1 h-7 rounded-lg bg-surface-100" />
      </div>
    </div>
  )
}

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [name,       setName]       = useState('')
  const [iconKey,    setIconKey]    = useState('utensils')
  const [colorKey,   setColorKey]   = useState('primary')
  const [saving,     setSaving]     = useState(false)
  const [formError,  setFormError]  = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await adminService.getCategories()
      setCategories(res.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function getCatAppearance(cat) {
    return {
      Icon: getIconComponent(cat.icon_key || 'tag'),
      col:  getColor(cat.color_key || 'primary'),
    }
  }

  function openCreate() {
    setEditing(null)
    setName('')
    setIconKey('utensils')
    setColorKey('primary')
    setFormError('')
    setShowModal(true)
  }

  function openEdit(cat) {
    setEditing(cat)
    setName(cat.name)
    setIconKey(cat.icon_key || 'utensils')
    setColorKey(cat.color_key || 'primary')
    setFormError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    if (!name.trim()) { setFormError('Nama kategori wajib diisi'); return }
    try {
      setSaving(true)
      if (editing) {
        await adminService.updateCategory(editing.id, { name: name.trim(), icon_key: iconKey, color_key: colorKey })
        toast('Kategori berhasil diperbarui')
      } else {
        await adminService.createCategory({ name: name.trim(), icon_key: iconKey, color_key: colorKey })
        toast('Kategori berhasil ditambahkan')
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
    const result = await confirmDelete(
      'Hapus kategori ini?',
      'Menu yang terkait akan kehilangan kategorinya.'
    )
    if (!result.isConfirmed) return
    setDeletingId(id)
    try {
      await adminService.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast('Kategori berhasil dihapus')
    } catch (e) {
      showError('Gagal', e.message)
    } finally {
      setDeletingId(null)
    }
  }

  // live preview in modal
  const PreviewIcon  = getIconComponent(iconKey)
  const previewColor = getColor(colorKey)

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Kelola Kategori</h1>
          {!loading && (
            <p className="mt-0.5 text-sm text-zinc-400">
              {categories.length} kategori terdaftar
            </p>
          )}
        </div>
        <Button onClick={openCreate} icon={<Plus size={16} />}>
          Tambah Kategori
        </Button>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          <span className="font-semibold">Gagal memuat:</span> {error}
          <button onClick={load} className="ml-auto text-red-500 hover:text-red-700 underline text-xs">
            Coba lagi
          </button>
        </div>
      )}

      {/* ── Info banner ──────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-primary-50 border border-primary-100 rounded-2xl text-sm text-primary-700">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>
            Kategori digunakan untuk mengelompokkan menu.{' '}
            <strong>Ikon &amp; warna</strong> tersimpan di database, tampil sama di semua perangkat.
          </span>
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!loading && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-surface-200">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <FolderOpen size={28} className="text-surface-300" />
          </div>
          <p className="text-zinc-600 font-semibold mb-1">Belum ada kategori</p>
          <p className="text-sm text-zinc-400 mb-6">Tambahkan kategori pertama untuk mengorganisir menu kamu.</p>
          <Button onClick={openCreate} icon={<Plus size={14} />} size="sm">
            Tambah Sekarang
          </Button>
        </div>
      )}

      {/* ── Category grid ────────────────────────────────────────────── */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence initial={false}>
            {categories.map((cat) => {
              const { Icon, col } = getCatAppearance(cat)
              return (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                  className="group relative bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-md p-5 flex flex-col gap-3 transition-shadow"
                >
                  {/* Icon badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${col.bg} ${col.text}`}>
                    <Icon size={22} />
                  </div>

                  {/* Name + ID */}
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm leading-snug break-words">{cat.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">ID #{cat.id}</p>
                  </div>

                  {/* Action row – visible on hover */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      {deletingId === cat.id
                        ? <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                        : <Trash2 size={12} />
                      }
                      Hapus
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Modal: Create / Edit ─────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Kategori' : 'Tambah Kategori'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-5">

          {/* Live preview */}
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${previewColor.bg} ${previewColor.text}`}>
              <PreviewIcon size={28} />
            </div>
          </div>

          {/* Name */}
          <Input
            label="Nama Kategori"
            autoFocus
            fullWidth
            value={name}
            onChange={(e) => { setName(e.target.value); setFormError('') }}
            placeholder="cth: Makanan, Minuman, Snack…"
            error={formError}
          />

          {/* Icon picker */}
          <div>
            <p className="text-sm font-medium text-zinc-700 mb-2">Pilih Ikon</p>
            <div className="grid grid-cols-5 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
              {ICON_OPTIONS.map(({ key, Icon: Ic, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIconKey(key)}
                  title={label}
                  className={[
                    'flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-medium transition-all',
                    iconKey === key
                      ? `${previewColor.bg} ${previewColor.text} ring-2 ring-inset ring-current`
                      : 'bg-surface-50 text-zinc-400 hover:bg-surface-100 hover:text-zinc-600',
                  ].join(' ')}
                >
                  <Ic size={16} />
                  <span className="leading-none truncate w-full text-center px-0.5">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="text-sm font-medium text-zinc-700 mb-2">Pilih Warna</p>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(({ key, dot }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorKey(key)}
                  className={[
                    'w-7 h-7 rounded-full transition-all flex items-center justify-center shrink-0',
                    dot,
                    colorKey === key
                      ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110'
                      : 'opacity-60 hover:opacity-100 hover:scale-105',
                  ].join(' ')}
                >
                  {colorKey === key && <CheckCircle2 size={13} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button type="submit" fullWidth loading={saving}>
              {editing ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  )
}
