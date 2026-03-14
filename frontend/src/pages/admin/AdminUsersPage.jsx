import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ShieldCheck, UserRound, ChefHat, Wallet, KeyRound } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import SelectDropdown from '../../components/ui/SelectDropdown'
import Toggle from '../../components/ui/Toggle'
import * as adminService from '../../services/adminService'
import { confirmDelete, showError, toast } from '../../utils/swal'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', Icon: ShieldCheck, badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'kitchen', label: 'Kitchen', Icon: ChefHat, badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'cashier', label: 'Cashier', Icon: Wallet, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
]

function roleMeta(role) {
  return ROLE_OPTIONS.find((item) => item.value === role) || ROLE_OPTIONS[0]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('admin')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState('')

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminService.getUsers()
      setUsers(response.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  function resetForm() {
    setUsername('')
    setFullName('')
    setRole('admin')
    setPassword('')
    setIsActive(true)
    setFormError('')
  }

  function openCreate() {
    setEditingUser(null)
    resetForm()
    setShowModal(true)
  }

  function openEdit(user) {
    setEditingUser(user)
    setUsername(user.username)
    setFullName(user.full_name)
    setRole(user.role)
    setPassword('')
    setIsActive(Boolean(user.is_active))
    setFormError('')
    setShowModal(true)
  }

  async function handleSave(event) {
    event.preventDefault()
    setFormError('')

    if (!username.trim()) {
      setFormError('Username wajib diisi')
      return
    }
    if (!fullName.trim()) {
      setFormError('Nama lengkap wajib diisi')
      return
    }
    if (!editingUser && password.length < 6) {
      setFormError('Password minimal 6 karakter')
      return
    }
    if (editingUser && password && password.length < 6) {
      setFormError('Password baru minimal 6 karakter')
      return
    }

    try {
      setSaving(true)
      const payload = {
        username: username.trim(),
        full_name: fullName.trim(),
        role,
        is_active: isActive,
      }

      if (password) {
        payload.password = password
      }

      if (editingUser) {
        await adminService.updateUser(editingUser.id, payload)
        toast('User berhasil diperbarui')
      } else {
        await adminService.createUser(payload)
        toast('User berhasil ditambahkan')
      }

      setShowModal(false)
      await loadUsers()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user) {
    const result = await confirmDelete(
      `Hapus user ${user.username}?`,
      'User yang dihapus tidak bisa login lagi.'
    )

    if (!result.isConfirmed) return

    try {
      setDeletingId(user.id)
      await adminService.deleteUser(user.id)
      setUsers((prev) => prev.filter((item) => item.id !== user.id))
      toast('User berhasil dihapus')
    } catch (err) {
      showError('Gagal hapus user', err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const columns = useMemo(() => [
    {
      key: 'username',
      label: 'User',
      className: 'text-surface-700',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface-100 text-surface-600">
            <UserRound size={16} />
          </span>
          <div>
            <p className="font-semibold text-surface-800">{row.username}</p>
            <p className="text-xs text-surface-400">{row.full_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      className: 'text-surface-700',
      render: (row) => {
        const meta = roleMeta(row.role)
        const Icon = meta.Icon
        return (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
            <Icon size={12} />
            {meta.label}
          </span>
        )
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      className: 'text-surface-700',
      render: (row) => (
        row.is_active
          ? <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Aktif</span>
          : <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">Nonaktif</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Dibuat',
      className: 'text-surface-500 whitespace-nowrap',
      render: (row) => new Date(row.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    },
  ], [])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Kelola User</h1>
          <p className="mt-1 text-sm text-surface-500">Atur akun admin, kitchen, dan cashier.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchKeys={['username', 'full_name', 'role']}
        emptyText="Belum ada user"
        actions={(row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg p-1.5 text-surface-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
              title="Edit user"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row)}
              disabled={deletingId === row.id}
              className="rounded-lg p-1.5 text-surface-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              title="Hapus user"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Tambah User'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="contoh: admin"
            fullWidth
            autoFocus
          />

          <Input
            label="Nama Lengkap"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nama user"
            fullWidth
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Role</span>
              <SelectDropdown
                options={ROLE_OPTIONS.map(({ value: v, label, Icon }) => ({
                  value: v,
                  label,
                  icon: <Icon size={14} />,
                }))}
                value={role}
                onChange={(val) => val && setRole(val)}
                showAllOption={false}
                neutralTrigger
                searchable={false}
                fullWidth
              />
            </div>

            <div className="flex flex-col justify-center gap-1">
              <span className="text-sm font-medium text-zinc-700">Status</span>
              <div className="flex items-center gap-3 rounded-xl border border-surface-200 px-4 py-2.5">
                <Toggle
                  checked={isActive}
                  onChange={setIsActive}
                />
                <span className="text-sm text-zinc-600">
                  {isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>

          <Input
            label={editingUser ? 'Password Baru (opsional)' : 'Password'}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
            leftIcon={<KeyRound size={15} />}
            fullWidth
          />

          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-surface-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : 'Tambah User')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
