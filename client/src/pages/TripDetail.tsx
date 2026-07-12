import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTripDetail } from '@/api/hooks/useTrips'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, ArrowRight, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react'
import TripTimeline from '@/components/trips/TripTimeline'
import TripActions from '@/components/trips/TripActions'
import StatusBadge from '@/components/common/StatusBadge'
import { fmtDate, fmtCurrency } from '@/lib/utils'

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { data: trip, isLoading } = useTripDetail(Number(id))

  if (isLoading) return <div className="p-8 animate-pulse text-slate-400">Loading trip details...</div>
  if (!trip) return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Trip not found</h2>
      <button onClick={() => navigate('/trips')} className="text-amber-600 flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Back</button>
    </div>
  )

  const isMaintenanceTriggered = trip.events?.some((e: any) => e.toStatus === 'COMPLETED' && e.notes?.includes('Maintenance'))

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-12">
      <button onClick={() => navigate('/trips')} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4"/> Back to Trips
      </button>

      {/* HEADER CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-slate-400 font-mono font-medium">#{trip.id}</span>
            <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">{trip.cargoWeightKg} kg Cargo</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            {trip.source} <ArrowRight className="w-5 h-5 text-slate-300" /> {trip.destination}
          </h1>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={trip.status} size="lg" />
          <div className="text-sm text-slate-500 text-right">
            Created by <span className="font-medium text-slate-700">{trip.createdBy?.name || 'Unknown'}</span> <br/>
            on {fmtDate(trip.createdAt)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* LEFT: TIMELINE (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <TripTimeline events={trip.events || []} />
          
          {/* FUEL LOGS & EXPENSES (Stubbed for now, full implementation in F9 context if needed, but simple tables here) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Trip Fuel Logs</h3>
              <div className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-lg border border-slate-100">
                No fuel logs for this trip
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Trip Expenses</h3>
              <div className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-lg border border-slate-100">
                No expenses for this trip
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: DETAILS CARD (40%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {isMaintenanceTriggered && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">Auto-Maintenance Triggered</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  The vehicle exceeded its service interval upon completing this trip. It has been moved to In Shop.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-900">Trip Details</h3>
            </div>
            <div className="p-5 divide-y divide-slate-100">
              
              <div className="grid grid-cols-2 gap-4 py-3 first:pt-0">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Source</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400"/> {trip.source}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Destination</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400"/> {trip.destination}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Vehicle</p>
                  <Link to={`/vehicles/${trip.vehicleId}`} className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline">
                    {trip.vehicle?.regNumber}
                  </Link>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Driver</p>
                  <Link to={`/drivers/${trip.driverId}`} className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline">
                    {trip.driver?.name}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Planned Distance</p>
                  <p className="text-sm font-medium text-slate-900">{trip.plannedDistanceKm} km</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Actual Distance</p>
                  <p className="text-sm font-medium text-slate-900">{trip.endOdometer ? (trip.endOdometer - trip.startOdometer) : '—'} km</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Start Odometer</p>
                  <p className="text-sm font-medium text-slate-700">{trip.startOdometer ?? '—'} km</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">End Odometer</p>
                  <p className="text-sm font-medium text-slate-700">{trip.endOdometer ?? '—'} km</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Cargo Weight</p>
                  <p className="text-sm font-medium text-slate-900">{trip.cargoWeightKg} kg</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Revenue</p>
                  <p className="text-sm font-semibold text-emerald-700">{trip.revenue ? fmtCurrency(trip.revenue) : '—'}</p>
                </div>
              </div>

              {trip.notes && (
                <div className="py-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{trip.notes}</p>
                </div>
              )}

            </div>
          </div>

          {trip.weatherRiskLevel && (
            <div className={`p-4 rounded-xl border flex gap-3 shadow-sm items-center
              ${trip.weatherRiskLevel === 'HIGH' ? 'bg-red-50 border-red-100 text-red-800' : 
                trip.weatherRiskLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-100 text-amber-800' : 
                'bg-emerald-50 border-emerald-100 text-emerald-800'}`}
            >
              {trip.weatherRiskLevel === 'HIGH' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <div>
                <p className="text-sm font-semibold capitalize">{trip.weatherRiskLevel.toLowerCase()} delay risk</p>
                {trip.weatherRec && <p className="text-xs opacity-90 mt-0.5 leading-tight">{trip.weatherRec}</p>}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-end">
            <TripActions trip={trip} />
          </div>

        </div>

      </div>
    </div>
  )
}
