import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Truck, Users, MapPin, Wrench, Fuel, BarChart3, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { roleLabels } from '@/lib/utils'

const navItems = [
  { path: '/dashboard',    icon: LayoutDashboard,  label: 'Dashboard' },
  { path: '/vehicles',     icon: Truck,             label: 'Fleet' },
  { path: '/drivers',      icon: Users,             label: 'Drivers' },
  { path: '/trips',        icon: MapPin,            label: 'Trips' },
  { path: '/maintenance',  icon: Wrench,            label: 'Maintenance' },
  { path: '/fuel-expenses',icon: Fuel,              label: 'Fuel & Expenses' },
  { path: '/analytics',    icon: BarChart3,         label: 'Analytics' },
  { path: '/settings',     icon: Settings,          label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  return (
    <div className="w-[240px] flex-shrink-0 h-full bg-slate-50 border-r border-slate-200 flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2">
        <div className="p-1.5 bg-amber-500 rounded-md">
          <Truck className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg text-slate-900 tracking-tight">TransitOps</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 h-10 rounded-md transition-colors ${
                isActive 
                  ? 'bg-amber-100 text-amber-900 font-medium' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="text-[14px]">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{roleLabels[user.role]}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
