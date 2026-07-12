import React from 'react'
import { vehicleStatusConfig, driverStatusConfig, tripStatusConfig } from '@/lib/utils'

type StatusBadgeProps = {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

const allConfigs: Record<string, { label: string; className: string }> = {
  ...vehicleStatusConfig,
  ...driverStatusConfig,
  ...tripStatusConfig,
  ACTIVE: { label: 'Active', className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded',
  md: 'text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider',
  lg: 'text-[13px] px-3.5 py-1 rounded-full font-bold uppercase tracking-wider',
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = allConfigs[status] || { label: status, className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' }
  const sClass = sizeClasses[size]
  
  return (
    <span className={`inline-flex items-center ${sClass} ${config.className}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
