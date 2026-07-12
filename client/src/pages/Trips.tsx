import { useState } from 'react'
import { Plus, ArrowRight, AlertTriangle } from 'lucide-react'
import { useTrips } from '@/api/hooks/useTrips'
import { useAuthStore } from '@/store/authStore'
import TripForm from '@/components/trips/TripForm'
import TripActions from '@/components/trips/TripActions'
import { statusToBadge, fmtDateRelative } from '@/lib/utils'

type TripStatusTab = 'ALL' | 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED'
const TABS: TripStatusTab[] = ['ALL', 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED']

export default function Trips() {
  const user = useAuthStore(s => s.user)
  const [activeTab, setActiveTab] = useState<TripStatusTab>('ALL')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Use undefined for ALL so we get full list, or filter by tab
  const { data: allTrips = [], isLoading } = useTrips()
  
  // Locally filter for tabs to show counts accurately
  const filteredTrips = activeTab === 'ALL' ? allTrips : allTrips.filter(t => t.status === activeTab)
  
  const counts = {
    ALL: allTrips.length,
    DRAFT: allTrips.filter(t => t.status === 'DRAFT').length,
    DISPATCHED: allTrips.filter(t => t.status === 'DISPATCHED').length,
    COMPLETED: allTrips.filter(t => t.status === 'COMPLETED').length,
    CANCELLED: allTrips.filter(t => t.status === 'CANCELLED').length,
  }

  const canCreate = user?.role === 'FLEET_MANAGER' || user?.role === 'DISPATCHER'

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trips & Dispatch</h1>
          <p className="text-slate-500 mt-1">Manage active routes and cargo</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreateForm(true)} className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> New Trip
          </button>
        )}
      </div>

      {/* STATUS TABS */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 pb-3 px-1 mr-8 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab 
                ? 'border-amber-500 text-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* TRIP CARDS / LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading && <div className="p-8 text-center text-slate-500 animate-pulse">Loading trips...</div>}
        {!isLoading && filteredTrips.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No trips found in this view.
          </div>
        )}
        {!isLoading && filteredTrips.length > 0 && (
          <div className="divide-y divide-slate-100">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {trip.status === 'DISPATCHED' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="In Progress" />
                    )}
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      {trip.source} <ArrowRight className="w-4 h-4 text-slate-400" /> {trip.destination}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusToBadge(trip.status)}`}>
                      {trip.status}
                    </span>
                    {trip.weatherRiskLevel === 'HIGH' && (
                      <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold border border-red-200">
                        <AlertTriangle className="w-3 h-3" /> ⚠ Risk
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">{trip.vehicle?.regNumber} ({trip.vehicle?.name})</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-medium">{trip.driver?.name}</span>
                    <span className="text-slate-300">•</span>
                    <span>Cargo: <strong className="text-slate-700">{trip.cargoWeightKg} kg</strong></span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">Created {fmtDateRelative(trip.createdAt)}</span>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center gap-3">
                  <TripActions trip={trip} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TripForm open={showCreateForm} onClose={() => setShowCreateForm(false)} />
    </div>
  )
}
