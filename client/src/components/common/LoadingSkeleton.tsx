import React from 'react'

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="animate-pulse w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={`h-4 bg-slate-200 dark:bg-slate-700 rounded ${j === 0 ? 'w-32' : j === cols-1 ? 'w-20 ml-auto' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16" />
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  )
}

export function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Live
    </div>
  )
}
