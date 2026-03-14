import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChefHat, LockKeyhole, LogIn, User } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-orange-100 bg-white shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                <ChefHat size={22} />
              </span>
              <div>
                <p className="text-sm font-medium text-orange-100">Orderly</p>
                <h1 className="text-xl font-extrabold tracking-tight">Admin Login</h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-zinc-700">Username</span>
              <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 focus-within:border-orange-300 focus-within:bg-white">
                <User size={16} className="text-zinc-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 w-full bg-transparent px-2 text-sm text-zinc-800 outline-none"
                  placeholder="Masukkan username admin"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-zinc-700">Password</span>
              <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 focus-within:border-orange-300 focus-within:bg-white">
                <LockKeyhole size={16} className="text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full bg-transparent px-2 text-sm text-zinc-800 outline-none"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 text-sm font-bold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn size={16} />
              {submitting ? 'Memproses...' : 'Masuk ke Admin'}
            </button>

            <Link
              to="/"
              className="inline-flex w-full items-center justify-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
            >
              Kembali ke aplikasi utama
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
