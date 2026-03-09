import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Tag, ClipboardList } from 'lucide-react'

const navItems = [
  { to: '/admin/menus',      label: 'Menu',      Icon: UtensilsCrossed },
  { to: '/admin/categories', label: 'Kategori',  Icon: Tag },
  { to: '/admin/orders',     label: 'Pesanan',   Icon: ClipboardList },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-surface-200 flex flex-col">
        <div className="flex items-center gap-2 h-16 px-5 border-b border-surface-200">
          <LayoutDashboard className="text-primary-600" size={22} />
          <span className="font-bold text-surface-800 text-lg">Admin</span>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
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
