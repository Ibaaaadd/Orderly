import React, { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ChefHat, Tag, ClipboardList, TrendingUp, BookOpen, UtensilsCrossed, LogOut } from 'lucide-react'
import { logoutAdmin } from '../../utils/adminAuth.js'

const navItems = [
  { to: '/admin',            label: 'Dashboard',        Icon: LayoutDashboard, end: true },
  { to: '/admin/orders',     label: 'Pesanan',          Icon: ClipboardList },
  { to: '/admin/menus',      label: 'Menu',             Icon: BookOpen },
  { to: '/admin/categories', label: 'Kategori',         Icon: Tag },
  { to: '/admin/reports',    label: 'Laporan Keuangan', Icon: TrendingUp },
  { to: '/admin/kitchen',    label: 'Kitchen Display',  Icon: UtensilsCrossed },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  function handleLogout() {
    logoutAdmin()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-surface-200 flex flex-col">
        <div className="flex items-center gap-2 h-16 px-5 border-b border-surface-200">
          <span className="bg-primary-600 text-white rounded-xl p-1.5">
            <ChefHat size={18} />
          </span>
          <span className="font-bold text-surface-800 text-lg">Orderly</span>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-200">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout Admin
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          >
            ← Kembali ke App
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarGutter: 'stable' }}
      >
        <Outlet />
      </main>
    </div>
  )
}
