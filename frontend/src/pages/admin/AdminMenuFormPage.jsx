import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, DollarSign, ImageIcon, Link, Package2, Plus, Save, Sparkles, Tag, Upload, X } from 'lucide-react'
import * as adminService from '../../services/adminService'
import { toast } from '../../utils/swal'
import PackageConfigurator from '../../components/admin/PackageConfigurator.jsx'

const EMPTY_FORM = {
  name: '',
  category_id: '',
  price: '',
  image_url: '',
  is_available: true,
  is_package: false,
  levels: [],
  package_rules: [],
}

function normalizePackageRules(packageRules = []) {
  return Array.isArray(packageRules)
    ? packageRules.map((rule, index) => ({
        rule_name: rule.rule_name || 'Isi Paket',
        sort_order: rule.sort_order ?? index,
        configured_items: Array.isArray(rule.configured_items) ? rule.configured_items : [],
      }))
    : []
}

function getPackageConfiguredItems(packageRules = []) {
  return Array.isArray(packageRules)
    ? packageRules.flatMap((rule) => (Array.isArray(rule.configured_items) ? rule.configured_items : []))
    : []
}

export default function AdminMenuFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState([])
  const [menuOptions, setMenuOptions] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [newLevelInput, setNewLevelInput] = useState('')
  const [imgMode, setImgMode] = useState('url')

  const pageTitle = isEdit ? 'Edit Menu' : 'Tambah Menu'
  const pageSubtitle = isEdit
    ? 'Ubah data menu dan isi paket dari menu existing.'
    : 'Buat menu baru tanpa modal agar form dan konfigurasi paket lebih lega.'

  const filteredMenuOptions = useMemo(
    () => menuOptions.filter((entry) => String(entry.id) !== String(id)),
    [menuOptions, id]
  )

  const loadPageData = useCallback(async () => {
    try {
      setLoading(true)
      setFormError('')

      const [categoriesRes, menusRes, menuRes] = await Promise.all([
        adminService.getCategories(),
        adminService.getMenus({ page: 1, limit: 500 }),
        isEdit ? adminService.getMenuById(id) : Promise.resolve(null),
      ])

      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      setMenuOptions(Array.isArray(menusRes.data) ? menusRes.data : [])

      if (menuRes?.data) {
        const menu = menuRes.data
        setForm({
          name: menu.name,
          category_id: menu.category_id ?? '',
          price: String(menu.price),
          image_url: menu.image_url ?? '',
          is_available: menu.is_available,
          is_package: menu.is_package === true,
          levels: Array.isArray(menu.levels) ? [...menu.levels] : [],
          package_rules: normalizePackageRules(menu.package_rules),
        })
      } else {
        setForm(EMPTY_FORM)
      }
    } catch (error) {
      setFormError(error.message || 'Gagal memuat data menu')
    } finally {
      setLoading(false)
    }
  }, [id, isEdit])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

  async function handleSave(event) {
    event.preventDefault()
    setFormError('')

    if (!form.name.trim()) {
      setFormError('Nama menu wajib diisi')
      return
    }

    if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError('Harga tidak valid')
      return
    }

    const packageItems = getPackageConfiguredItems(form.package_rules)

    if (form.is_package && packageItems.length === 0) {
      setFormError('Menu paket wajib punya minimal satu item paket')
      return
    }

    if (form.is_package) {
      for (const [itemIndex, item] of packageItems.entries()) {
        if (!item.selected_menu_id) {
          setFormError(`Item paket ${itemIndex + 1} belum memilih menu`)
          return
        }
      }
    }

    const payload = {
      name: form.name.trim(),
      category_id: form.category_id ? Number(form.category_id) : null,
      price: Number(form.price),
      image_url: form.image_url.trim() || null,
      is_available: form.is_available,
      is_package: form.is_package === true,
      levels: form.is_package ? [] : form.levels,
      package_rules: form.is_package ? normalizePackageRules(form.package_rules) : [],
    }

    try {
      setSaving(true)
      if (isEdit) {
        await adminService.updateMenu(id, payload)
        toast('Menu berhasil diperbarui')
      } else {
        await adminService.createMenu(payload)
        toast('Menu berhasil ditambahkan')
      }
      navigate('/admin/menus')
    } catch (error) {
      setFormError(error.message || 'Gagal menyimpan menu')
    } finally {
      setSaving(false)
    }
  }

  function addLevel() {
    const value = newLevelInput.trim()
    if (!value || form.levels.includes(value)) return
    setForm((prev) => ({ ...prev, levels: [...prev.levels, value] }))
    setNewLevelInput('')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-surface-200 bg-white p-10 text-center text-sm text-surface-500">
          Memuat form menu...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_100%_0%,rgba(14,165,233,0.08),transparent_34%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] p-4 md:p-6">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="flex items-start justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_10px_35px_-22px_rgba(15,23,42,0.35)] backdrop-blur">
          <div>
          <button
            type="button"
            onClick={() => navigate('/admin/menus')}
            className="mb-3 inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm font-semibold text-surface-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={15} /> Kembali ke daftar menu
          </button>
            <h1 className="mt-3 text-3xl font-bold text-surface-900">{pageTitle}</h1>
            <p className="mt-1 text-sm text-surface-500">{pageSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
          {formError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <X size={15} className="mt-0.5 shrink-0" />
              {formError}
            </div>
          )}

          <section className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)]">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Informasi Utama</p>
              <h2 className="mt-1 text-xl font-bold text-surface-900">Data Menu</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-surface-500">
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-800 placeholder-surface-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="cth. Nasi Goreng Spesial"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-surface-500">
                  <span className="inline-flex items-center gap-1"><Tag size={11} />Kategori</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 pr-10 text-sm text-surface-800 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    value={form.category_id}
                    onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
                  >
                    <option value="">Tanpa Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-surface-500">
                  <span className="inline-flex items-center gap-1"><DollarSign size={11} />Harga (Rp) <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-800 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => {
                    const nextIsPackage = !prev.is_package
                    return {
                      ...prev,
                      is_package: nextIsPackage,
                      levels: nextIsPackage ? [] : prev.levels,
                    }
                  })}
                  className="flex min-h-[88px] items-center justify-between rounded-2xl border border-surface-200 bg-surface-50 p-4 text-left"
                >
                  <div className="pr-3">
                    <p className="text-sm font-semibold text-surface-800">Menu Paket</p>
                    <p className="mt-0.5 text-xs text-surface-400">Aktifkan jika menu ini disusun dari menu existing.</p>
                  </div>
                  <div className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-all duration-200 ${form.is_package ? 'justify-end bg-indigo-500 shadow-inner shadow-indigo-700/20' : 'justify-start bg-surface-300'}`}>
                    <span className="h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.28)]" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, is_available: !prev.is_available }))}
                  className="flex min-h-[88px] items-center justify-between rounded-2xl border border-surface-200 bg-surface-50 p-4 text-left"
                >
                  <div className="pr-3">
                    <p className="text-sm font-semibold text-surface-800">Menu Tersedia</p>
                    <p className="mt-0.5 text-xs text-surface-400">Tampilkan menu ini ke pelanggan.</p>
                  </div>
                  <div className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-all duration-200 ${form.is_available ? 'justify-end bg-primary-500 shadow-inner shadow-primary-700/20' : 'justify-start bg-surface-300'}`}>
                    <span className="h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.28)]" />
                  </div>
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Visual</p>
                <h2 className="mt-1 text-xl font-bold text-surface-900">Gambar Menu</h2>
              </div>
              {form.is_package && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  <Package2 size={12} /> Paket
                </span>
              )}
            </div>

            <div className="mb-3 flex w-fit gap-1 rounded-xl border border-surface-200 bg-surface-100 p-1">
              <button
                type="button"
                onClick={() => { setImgMode('url'); setForm((prev) => ({ ...prev, image_url: '' })) }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${imgMode === 'url' ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
              >
                <Link size={11} /> URL
              </button>
              <button
                type="button"
                onClick={() => { setImgMode('upload'); setForm((prev) => ({ ...prev, image_url: '' })) }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${imgMode === 'upload' ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
              >
                <Upload size={11} /> Upload
              </button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex-1">
                {imgMode === 'url' ? (
                  <input
                    className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-800 placeholder-surface-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    value={form.image_url}
                    onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
                    placeholder="https://..."
                  />
                ) : (
                  <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-surface-200 bg-surface-50 px-4 py-5 transition-colors hover:border-primary-400 hover:bg-primary-50">
                    <Upload size={20} className="text-surface-400" />
                    <span className="text-xs font-medium text-surface-500">Klik untuk pilih gambar</span>
                    <span className="text-[10px] text-surface-400">JPG, PNG, WebP — maks 2 MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const currentScrollY = window.scrollY
                        const file = event.target.files?.[0]
                        if (!file) return
                        if (file.size > 2 * 1024 * 1024) {
                          setFormError('Ukuran gambar maks 2 MB')
                          return
                        }
                        setFormError('')
                        const reader = new FileReader()
                        reader.onload = () => {
                          setForm((prev) => ({ ...prev, image_url: reader.result }))
                          requestAnimationFrame(() => {
                            window.scrollTo({ top: currentScrollY, behavior: 'auto' })
                          })
                        }
                        reader.readAsDataURL(file)
                        event.target.value = ''
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="relative shrink-0">
                {form.image_url ? (
                  <>
                    <img src={form.image_url} alt="Preview menu" className="h-32 w-32 rounded-3xl border border-surface-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-surface-200 bg-surface-100 text-surface-300">
                    <ImageIcon size={26} />
                  </div>
                )}
              </div>
            </div>
          </section>

          {!form.is_package && (
            <section className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)]">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Opsional</p>
                <h2 className="mt-1 text-xl font-bold text-surface-900">Level Menu</h2>
              </div>

              {form.levels.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {form.levels.map((level, index) => (
                    <span key={`${level}-${index}`} className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                      {level}
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, levels: prev.levels.filter((_, currentIndex) => currentIndex !== index) }))}
                        className="text-orange-400 hover:text-orange-700"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-800 placeholder-surface-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={newLevelInput}
                  onChange={(event) => setNewLevelInput(event.target.value)}
                  placeholder="cth. Pedas, Level 2, Extra Hot"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addLevel()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addLevel}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </section>
          )}

          {form.is_package && (
            <PackageConfigurator
              menuOptions={filteredMenuOptions}
              value={form.package_rules}
              onChange={(nextRules) => setForm((prev) => ({ ...prev, package_rules: nextRules }))}
            />
          )}
          </div>

          <aside className="space-y-4">
            <section className="sticky top-6 rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)]">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Aksi</p>
              <h2 className="mt-1 text-lg font-bold text-surface-900">Simpan Perubahan</h2>
            </div>

            <div className="space-y-3 text-sm text-surface-500">
              <p>Page ini menggantikan modal lama supaya input paket dan item lebih lega.</p>
              {form.is_package && (
                <p className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-700">
                  Customer tidak memilih isi paket. Admin hanya menentukan daftar item dari menu existing.
                </p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
              >
                <Save size={16} /> {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah Menu'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/menus')}
                className="w-full rounded-2xl border border-surface-200 px-4 py-3 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors"
              >
                Batal
              </button>
            </div>
            </section>
          </aside>
        </form>
      </div>
    </div>
  )
}