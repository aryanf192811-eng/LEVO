import React from 'react'
import { AlertTriangle, CloudRain, Wrench, MapPin, Check, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications, useMarkAsRead, useMarkAllRead } from '@/api/hooks/useNotifications'
import { fmtDateRelative } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  LICENSE_EXPIRY:  { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-50' },
  WEATHER_ALERT:   { icon: CloudRain,     color: 'text-blue-500',   bg: 'bg-blue-50' },
  MAINTENANCE_DUE: { icon: Wrench,        color: 'text-orange-500', bg: 'bg-orange-50' },
  TRIP_UPDATE:     { icon: MapPin,        color: 'text-green-500',  bg: 'bg-green-50' },
}

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { data: notifications = [], isLoading } = useNotifications()
  const readMutation = useMarkAsRead()
  const readAllMutation = useMarkAllRead()
  const navigate = useNavigate()

  const handleRead = async (id: number, meta?: any) => {
    try {
      await readMutation.mutateAsync(id)
      if (meta?.tripId) {
        navigate(`/trips/${meta.tripId}`)
        onClose()
      } else if (meta?.vehicleId) {
        navigate(`/vehicles/${meta.vehicleId}`)
        onClose()
      } else if (meta?.driverId) {
        navigate(`/drivers/${meta.driverId}`)
        onClose()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleReadAll = async () => {
    try {
      await readAllMutation.mutateAsync()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="w-[380px] max-h-[480px] flex flex-col bg-white">
      <div className="flex justify-between items-center p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleReadAll} className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Bell className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs mt-1">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => {
              const config = TYPE_CONFIG[n.type] || { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50' }
              const Icon = config.icon
              return (
                <div 
                  key={n.id} 
                  onClick={() => handleRead(n.id, n.metadata)}
                  className={`p-4 flex gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{fmtDateRelative(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-slate-100 text-center">
        <button className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  )
}
