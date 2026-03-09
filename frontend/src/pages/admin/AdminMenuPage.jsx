import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import * as adminService from '../../services/adminService'
import { formatPrice } from '../../utils/formatPrice'

const EMPTY_FORM = {
  name: '',
  category_id: '',
  price: '',
  image_url: '',
  is_available: true,
}

export default function AdminMenuPage() {
  const [menus, setMenus]           = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState(null)   // null = create mode
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [menusRes, catsRes] = await Promise.all([
        adminService.getMenus(),
        adminService.getCategories(),
      ])
      setMenus(menusRes.data)
      setCategories(catsRes.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
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
    })
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
    }
    try {
      setSaving(true)
      if (editing) {
        await adminService.updateMenu(editing.id, payload)
      } else {
        await adminService.createMenu(payload)
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
    if (!confirm('Hapus menu ini?')) return
    setDeletingId(id)
    try {
      await adminService.deleteMenu(id)
      setMenus((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      alert(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
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

      {loading ? (
        <div className="text-center py-16 text-surface-400">Memuat…</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Kategori</th>
                <th className="text-right px-4 py-3 font-semibold text-surface-600">Harga</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600">Tersedia</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {menus.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-surface-400">
                    Belum ada menu
                  </td>
                </tr>
              )}
              {menus.map((menu) => {
                const cat = categories.find((c) => c.id === menu.category_id)
                return (
                  <tr key={menu.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-800">
                      <div className="flex items-center gap-3">
                        {menu.image_url && (
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        {menu.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-500">{cat?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-surface-800">
                      {formatPrice(Number(menu.price))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {menu.is_available
                        ? <Check size={16} className="text-green-500 mx-auto" />
                        : <X size={16} className="text-red-400 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-surface-200">
              <h2 className="font-bold text-surface-800 text-lg">
                {editing ? 'Edit Menu' : 'Tambah Menu'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-surface-400 hover:text-surface-700 rounded-lg hover:bg-surface-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama menu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Kategori</label>
                <select
                  className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">— Tanpa Kategori —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  URL Gambar
                </label>
                <input
                  className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_available"
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="is_available" className="text-sm text-surface-700 font-medium">
                  Menu tersedia
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-surface-300 text-surface-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
