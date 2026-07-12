import React from 'react'
import { fmtDate, fmtDateRelative, roleLabels } from '@/lib/utils'
import { TripStatus } from '@/types'

const statusColors: Record<TripStatus, string> = {
  DRAFT:      'bg-slate-400',
  DISPATCHED: 'bg-blue-500',
  COMPLETED:  'bg-emerald-500',
  CANCELLED:  'bg-red-500',
}

interface TripTimelineProps {
  events: any[]
}

export default function TripTimeline({ events }: TripTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        No events recorded yet
      </div>
    )
  }

  // Ensure newest first (assuming backend sends them in some order, we sort descending by date)
  const sortedEvents = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <h3 className="font-semibold text-slate-900 mb-6 text-lg tracking-tight">Audit Timeline</h3>
      <div className="relative">
        {sortedEvents.map((event, index) => {
          const isLast = index === sortedEvents.length - 1
          const dotColor = statusColors[event.toStatus as TripStatus] || 'bg-slate-400'
          
          return (
            <div key={event.id} className="relative flex gap-6 pb-8 last:pb-0 group">
              {/* Left Timestamp Column */}
              <div className="w-20 pt-1 shrink-0 text-right">
                <div className="text-[11px] font-semibold text-slate-500 leading-tight">
                  {fmtDate(event.createdAt).split(' ').slice(0,2).join(' ')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Timeline Connector & Dot */}
              <div className="relative flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${dotColor} z-10 ring-4 ring-white shadow-sm mt-1.5`} />
                {!isLast && (
                  <div className="absolute top-4 bottom-[-2rem] w-px bg-slate-200 group-hover:bg-slate-300 transition-colors" />
                )}
              </div>

              {/* Right Content */}
              <div className="flex-1 pt-0.5">
                <p className="text-[15px] font-semibold text-slate-900 tracking-tight">
                  {event.fromStatus === event.toStatus ? event.toStatus : `${event.fromStatus} → ${event.toStatus}`}
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-700">{event.actor?.name || 'System'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{event.actor?.role ? roleLabels[event.actor.role] : 'Automated'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 text-xs">{fmtDateRelative(event.createdAt)}</span>
                </div>
                {event.notes && (
                  <p className="mt-2 text-[13px] italic text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    "{event.notes}"
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
