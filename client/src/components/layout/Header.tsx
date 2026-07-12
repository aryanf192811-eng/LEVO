import { useLocation } from 'react-router-dom'
import { BellRing, Check, Sun, Moon } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuthStore } from '@/store/authStore'
import { useUnreadCount } from '@/api/hooks/useNotifications'
import NotificationPanel from '@/components/notifications/NotificationPanel'
import { useTheme } from '@/hooks/useTheme'

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
  const { isDark, toggle } = useTheme()
  
  // Title derivation
  const baseRoute = '/' + location.pathname.split('/')[1]
  const title = routeTitles[baseRoute] || 'Dashboard'

  const { data: unreadCount = 0 } = useUnreadCount()

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[var(--bg-0)] border-b border-slate-200 dark:border-[var(--border)] shrink-0 transition-colors">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-[var(--text-primary)]">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[var(--bg-1)] text-slate-600 dark:text-[var(--text-muted)] transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[var(--bg-1)] transition-colors outline-none focus:ring-2 focus:ring-amber-500">
              <BellRing className="w-5 h-5 text-slate-600 dark:text-[var(--text-muted)]" />
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
              className="bg-white dark:bg-[var(--bg-0)] rounded-lg shadow-lg border border-slate-200 dark:border-[var(--border)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50"
            >
              <NotificationPanel onClose={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))} />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
