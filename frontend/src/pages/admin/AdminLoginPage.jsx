import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChefHat, LockKeyhole, LogIn, User } from 'lucide-react'
import { isAdminAuthenticated, setAdminSession } from '../../utils/adminAuth.js'
import authService from '../../services/authService.js'

function resolveRedirect(target) {
  if (!target) return '/admin'
  if (!target.startsWith('/')) return '/admin'
  if (target.startsWith('/admin/login')) return '/admin'
  return target
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const redirect = resolveRedirect(params.get('redirect'))

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate(redirect, { replace: true })
    }
  }, [navigate, redirect])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await authService.login({ username, password })
      setAdminSession({
        token: response.data?.token,
        user: response.data?.user,
      })
      navigate(redirect, { replace: true })
    } catch (err) {
      setSubmitting(false)
      setError(err.message || 'Username atau password admin tidak valid.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,_#fffaf5_0%,_#fff7ed_100%)] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-[2rem] border border-orange-100/80 bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,_#c2410c_0%,_#f59e0b_100%)] text-white shadow-[0_14px_30px_rgba(234,88,12,0.18)]">
            <ChefHat size={28} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Orderly Admin</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">Masuk ke dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Gunakan akun yang terdaftar di tabel users untuk membuka area admin dan kitchen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-700">Username</span>
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 transition-colors focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(251,146,60,0.14)]">
                  <User size={18} className="text-zinc-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 w-full bg-transparent text-sm font-medium text-zinc-800 outline-none"
                    placeholder="Masukkan username admin"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-700">Password</span>
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 transition-colors focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(251,146,60,0.14)]">
                  <LockKeyhole size={18} className="text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full bg-transparent text-sm font-medium text-zinc-800 outline-none"
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </label>

              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#c2410c_0%,_#ea580c_52%,_#f59e0b_100%)] text-sm font-bold text-white shadow-[0_16px_30px_rgba(234,88,12,0.28)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn size={18} />
                {submitting ? 'Memproses...' : 'Masuk ke Admin'}
              </button>

              <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 text-sm">
                <p className="text-zinc-400">Akses hanya untuk user terdaftar.</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 font-semibold text-zinc-600 transition-colors hover:text-orange-600"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </Link>
              </div>
        </form>
      </div>
    </div>
  )
}
