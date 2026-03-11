import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ChefHat, Tag, ClipboardList, TrendingUp, BookOpen } from 'lucide-react'

const navItems = [
  { to: '/admin',            label: 'Dashboard',        Icon: LayoutDashboard, end: true },
  { to: '/admin/orders',     label: 'Pesanan',          Icon: ClipboardList },
  { to: '/admin/menus',      label: 'Menu',             Icon: BookOpen },
  { to: '/admin/categories', label: 'Kategori',         Icon: Tag },
  { to: '/admin/reports',    label: 'Laporan Keuangan', Icon: TrendingUp },
]

export default function AdminLayout() {
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
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          >
            ← Kembali ke App
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
