import React from 'react'
import { Truck, Users, MapPin, Wrench, Bell } from 'lucide-react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-slate-300 dark:text-slate-600 mb-4 [&>svg]:w-12 [&>svg]:h-12">
        {icon}
      </div>
      <h3 className="text-base font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">{subtitle}</p>}
      {action && (
        <button 
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export const EmptyVehicles = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState 
    icon={<Truck />} 
    title="No vehicles registered" 
    subtitle="Add your first vehicle to get started"
    action={onAdd ? { label: '+ Add Vehicle', onClick: onAdd } : undefined} 
  />
)

export const EmptyDrivers = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState 
    icon={<Users />} 
    title="No drivers in the system" 
    action={onAdd ? { label: '+ Add Driver', onClick: onAdd } : undefined} 
  />
)

export const EmptyTrips = ({ filtered, onAdd }: { filtered?: boolean, onAdd?: () => void }) => (
  <EmptyState 
    icon={<MapPin />} 
    title={filtered ? "No trips match this filter" : "No trips yet"}
    action={onAdd ? { label: '+ Create Trip', onClick: onAdd } : undefined} 
  />
)

export const EmptyMaintenance = () => (
  <EmptyState icon={<Wrench />} title="No maintenance records" />
)

export const EmptyNotifications = () => (
  <EmptyState icon={<Bell />} title="All caught up — no new notifications" />
)
