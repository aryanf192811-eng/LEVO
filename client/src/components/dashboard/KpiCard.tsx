import React from 'react'

interface KpiCardProps {
  label: string
  value: string | number
  subValue?: string
  icon: React.ReactNode
  colorVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  isLoading?: boolean
}

const variantStyles = {
  default: { iconBg: 'bg-slate-100', iconText: 'text-slate-600', valText: 'text-slate-900', subText: 'text-slate-500' },
  success: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', valText: 'text-emerald-700', subText: 'text-emerald-600' },
  warning: { iconBg: 'bg-amber-50', iconText: 'text-amber-600', valText: 'text-amber-700', subText: 'text-amber-600' },
  danger:  { iconBg: 'bg-red-50', iconText: 'text-red-600', valText: 'text-red-700', subText: 'text-red-600' },
  info:    { iconBg: 'bg-blue-50', iconText: 'text-blue-600', valText: 'text-blue-700', subText: 'text-blue-600' },
}

export default function KpiCard({ label, value, subValue, icon, colorVariant = 'default', isLoading }: KpiCardProps) {
  const styles = variantStyles[colorVariant]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-16 bg-slate-100 rounded mb-2" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${styles.iconBg} ${styles.iconText}`}>
          {icon}
        </div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500">{label}</h3>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className={`text-3xl font-bold tracking-tight ${styles.valText}`}>
          {value}
        </div>
      </div>
      {subValue && (
        <div className={`text-xs mt-2 font-medium ${styles.subText}`}>
          {subValue}
        </div>
      )}
    </div>
  )
}
