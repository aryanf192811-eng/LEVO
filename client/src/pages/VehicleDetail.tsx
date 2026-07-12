import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVehicleDetail } from '@/api/hooks/useVehicles'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Truck, Edit, AlertTriangle } from 'lucide-react'
import { statusToBadge, fmtDate } from '@/lib/utils'
import { DetailSkeleton } from '@/components/common/LoadingSkeleton'

const fmtNum = (n?: number) => n?.toLocaleString('en-IN') ?? '-'
const fmtCur = (n?: number) => n ? '₹' + n.toLocaleString('en-IN') : '-'

export default function VehicleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { data: vehicle, isLoading } = useVehicleDetail(Number(id))
  const [activeTab, setActiveTab] = useState<'trips'|'maintenance'|'fuel'|'expenses'>('trips')

  if (isLoading) return <DetailSkeleton />
  if (!vehicle) return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Vehicle not found</h2>
      <button onClick={() => navigate('/vehicles')} className="text-amber-600 flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Back</button>
    </div>
  )

  const srvInterval = vehicle.serviceIntervalKm || 5000
  const kmSinceSrv = (vehicle.currentOdometer || 0) - (vehicle.lastServiceOdometer || 0)
  const srvPct = Math.min(100, Math.max(0, (kmSinceSrv / srvInterval) * 100))
  const isNearLimit = (srvInterval - kmSinceSrv) <= 200

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-12">
      <button onClick={() => navigate('/vehicles')} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4"/> Back to Fleet
      </button>

      {/* HERO */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
            <Truck className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{vehicle.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusToBadge(vehicle.status)}`}>{vehicle.status}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{vehicle.regNumber}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">{vehicle.type}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{vehicle.region} Region</span>
            </div>
          </div>
        </div>
        
        {user?.role === 'FLEET_MANAGER' && (
          <button className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
            <Edit className="w-4 h-4" /> Edit Details
          </button>
        )}
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Max Capacity</p>
          <p className="text-2xl font-bold text-slate-900">{fmtNum(vehicle.maxCapacityKg)} <span className="text-sm font-medium text-slate-500">kg</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Current Odometer</p>
          <p className="text-2xl font-bold text-slate-900">{fmtNum(vehicle.currentOdometer)} <span className="text-sm font-medium text-slate-500">km</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Acquisition Cost</p>
          <p className="text-2xl font-bold text-slate-900">{fmtCur(vehicle.acquisitionCost)}</p>
        </div>
      </div>

      {/* ANALYTICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">ROI</p>
          <p className={`text-xl font-bold ${(vehicle.roi || 0) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {(vehicle.roi || 0) > 0 ? '+' : ''}{(vehicle.roi || 0).toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Efficiency</p>
          <p className="text-xl font-bold text-slate-900">{(vehicle.fuelEfficiency || 0).toFixed(1)} <span className="text-sm text-slate-500">km/L</span></p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Revenue</p>
          <p className="text-xl font-bold text-emerald-700">{fmtCur(vehicle.totalRevenue || 0)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Costs</p>
          <p className="text-xl font-bold text-red-700">{fmtCur((vehicle.totalFuelCost || 0) + (vehicle.totalMaintenanceCost || 0))}</p>
        </div>
      </div>

      {/* SERVICE INTERVAL */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              Maintenance Status 
              {isNearLimit && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {fmtNum(kmSinceSrv)} km driven since last service
            </p>
          </div>
          <div className="text-sm font-medium text-slate-900">
            Interval: {fmtNum(srvInterval)} km
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
          <div className={`h-full rounded-full transition-all duration-1000 ${isNearLimit ? 'bg-red-500' : srvPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${srvPct}%` }} />
        </div>
        {isNearLimit && (
          <p className="text-xs font-medium text-amber-600 mt-2">Vehicle is approaching service limit. Auto-maintenance will trigger soon.</p>
        )}
      </div>

      {/* TABS */}
      <div className="border-b border-slate-200 mb-6 flex gap-6">
        {(['trips', 'maintenance', 'fuel', 'expenses'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[300px] overflow-hidden">
        {activeTab === 'trips' && (
          vehicle.trips.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No trips recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehicle.trips.map(trip => (
                    <tr key={trip.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">#{trip.id}</td>
                      <td className="px-6 py-4">{trip.source} → {trip.destination}</td>
                      <td className="px-6 py-4 text-slate-500">{fmtDate(trip.createdAt)}</td>
                      <td className="px-6 py-4">{trip.driver?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${statusToBadge(trip.status)}`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'maintenance' && (
          vehicle.maintenanceLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No maintenance logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Cost</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehicle.maintenanceLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500">{fmtDate(log.openedAt)}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{log.type}</td>
                      <td className="px-6 py-4 text-slate-500">{log.description}</td>
                      <td className="px-6 py-4 text-right font-medium">{fmtCur(log.cost)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                          log.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'fuel' && (
          vehicle.fuelLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No fuel logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Odometer</th>
                    <th className="px-6 py-4 text-right">Litres</th>
                    <th className="px-6 py-4 text-right">Cost/Litre</th>
                    <th className="px-6 py-4 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehicle.fuelLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500">{fmtDate(log.date)}</td>
                      <td className="px-6 py-4 text-slate-500">{fmtNum(log.odometerReading)} km</td>
                      <td className="px-6 py-4 text-right font-medium">{log.litres.toFixed(1)} L</td>
                      <td className="px-6 py-4 text-right text-slate-500">{fmtCur(log.costPerLitre)}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">{fmtCur(log.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'expenses' && (
          vehicle.expenses.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No extra expenses recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehicle.expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500">{fmtDate(exp.date)}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 capitalize">{exp.type.toLowerCase().replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-slate-500">{exp.description || '-'}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">{fmtCur(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

    </div>
  )
}
