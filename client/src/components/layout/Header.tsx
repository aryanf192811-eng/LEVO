import { useLocation } from 'react-router-dom'
import { BellRing, Check } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuthStore } from '@/store/authStore'
import { useUnreadCount } from '@/api/hooks/useNotifications'
import NotificationPanel from '@/components/notifications/NotificationPanel'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Fleet',
  '/drivers': 'Drivers',
  '/trips': 'Trips',
  '/maintenance': 'Maintenance',
  '/fuel-expenses': 'Fuel & Expenses',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export default function Header() {
  const location = useLocation()
  const { user } = useAuthStore()
  
  // Title derivation
  const baseRoute = '/' + location.pathname.split('/')[1]
  const title = routeTitles[baseRoute] || 'Dashboard'

  const unreadCount = useUnreadCount()

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-amber-500">
              <BellRing className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              align="end"
              className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50"
            >
              <NotificationPanel onClose={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))} />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
