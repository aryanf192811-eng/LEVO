import { useAuthStore } from '@/store/authStore'
import { useKPIs, useVehicleStatusBreakdown, useFuelEfficiency, useVehicleROI, useOperationalCosts } from '@/api/hooks/useDashboard'
import KpiCard from '@/components/dashboard/KpiCard'
import FleetStatusChart from '@/components/dashboard/FleetStatusChart'
import CompliancePanel from '@/components/dashboard/CompliancePanel'
import { Truck, CheckCircle2, Navigation, Activity, Users, AlertTriangle, Plus, ArrowRight } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { statusToBadge } from '@/lib/utils'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: kpis, isLoading: isLoadingKPIs } = useKPIs()
  const { data: vStatus } = useVehicleStatusBreakdown()
  const { data: roiData } = useVehicleROI()
  const { data: costsData } = useOperationalCosts()
  const { data: fuelData } = useFuelEfficiency()

  const renderKPIs = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Platform Metrics</h2>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live • updates every 8s
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Vehicles" value={kpis?.totalVehicles ?? '-'} icon={<Truck className="w-5 h-5" />} isLoading={isLoadingKPIs} />
          <KpiCard label="Available" value={kpis?.availableVehicles ?? '-'} icon={<CheckCircle2 className="w-5 h-5" />} colorVariant="success" isLoading={isLoadingKPIs} />
          <KpiCard label="Active Trips" value={kpis?.activeTrips ?? '-'} icon={<Navigation className="w-5 h-5" />} colorVariant="info" isLoading={isLoadingKPIs} />
          <KpiCard label="Utilization" value={`${kpis?.fleetUtilization ?? 0}%`} icon={<Activity className="w-5 h-5" />} isLoading={isLoadingKPIs} />
          <KpiCard label="Drivers On Duty" value={kpis?.driversOnDuty ?? '-'} icon={<Users className="w-5 h-5" />} isLoading={isLoadingKPIs} />
          <KpiCard label="Expiring Licenses" value={kpis?.expiring30Days ?? '-'} icon={<AlertTriangle className="w-5 h-5" />} colorVariant={(kpis?.expiring30Days ?? 0) > 0 ? 'warning' : 'default'} isLoading={isLoadingKPIs} />
        </div>
      </div>
    )
  }

  const renderFleetManager = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-900">Recent Trips</h3>
          <Link to="/trips" className="text-sm text-amber-600 hover:text-amber-700 font-medium">View all</Link>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kpis?.recentTrips?.map((trip: any) => (
                <tr key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{trip.source}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="font-medium text-slate-900">{trip.destination}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{trip.vehicle?.name || trip.vehicleId}</td>
                  <td className="px-4 py-3 text-slate-600">{trip.driver?.name || trip.driverId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusToBadge(trip.status)}`}>
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!kpis?.recentTrips || kpis.recentTrips.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No recent trips</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col">
        <h3 className="font-semibold text-slate-900 mb-4">Fleet Status Overview</h3>
        <div className="flex-1 flex items-center justify-center">
          <FleetStatusChart data={vStatus} />
        </div>
      </div>
    </div>
  )

  const renderDispatcher = () => {
    const activeTrips = kpis?.recentTrips?.filter((t: any) => t.status === 'DISPATCHED') || []
    const pendingTrips = kpis?.recentTrips?.filter((t: any) => t.status === 'DRAFT') || []
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Dispatch Queue</h3>
          <button onClick={() => navigate('/trips')} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Trip
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <h4 className="font-medium text-slate-900 mb-4 flex items-center justify-between">
              Active Trips <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">{activeTrips.length}</span>
            </h4>
            <div className="space-y-3">
              {activeTrips.map((t: any) => (
                <div key={t.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900">{t.source} → {t.destination}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.vehicle?.name} • {t.driver?.name}</p>
                  </div>
                </div>
              ))}
              {activeTrips.length === 0 && <p className="text-sm text-slate-500">No active trips</p>}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <h4 className="font-medium text-slate-900 mb-4 flex items-center justify-between">
              Pending Drafts <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{pendingTrips.length}</span>
            </h4>
            <div className="space-y-3">
              {pendingTrips.map((t: any) => (
                <div key={t.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900">{t.source} → {t.destination}</p>
                  </div>
                  <button className="text-xs font-medium text-amber-600 hover:text-amber-700">Dispatch</button>
                </div>
              ))}
              {pendingTrips.length === 0 && <p className="text-sm text-slate-500">No pending drafts</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSafetyOfficer = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Compliance & Safety Overview</h3>
      <CompliancePanel />
    </div>
  )

  const renderFinancialAnalyst = () => {
    const totalCosts = costsData?.reduce((acc: number, curr: any) => acc + curr.totalCost, 0) || 0
    const avgFuelEff = fuelData?.length ? (fuelData.reduce((acc: number, curr: any) => acc + curr.efficiency, 0) / fuelData.length).toFixed(1) : '-'
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Top Vehicle ROI</h3>
          <div className="space-y-3">
            {roiData?.slice(0, 5).map((item: any) => (
              <div key={item.vehicleId} className="flex justify-between items-center p-3 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-900">{item.vehicleName}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">Rev: ${item.revenue}</span>
                  <span className={`text-sm font-semibold ${item.roi > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {item.roi > 0 ? '+' : ''}{item.roi.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            {!roiData?.length && <p className="text-sm text-slate-500">No ROI data available</p>}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Operational Cost (Monthly)</p>
              <p className="text-3xl font-bold text-slate-900">${totalCosts.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Avg Fleet Fuel Efficiency</p>
              <p className="text-3xl font-bold text-slate-900">{avgFuelEff} <span className="text-lg text-slate-500">mpg</span></p>
            </div>
          </div>
          <button onClick={() => navigate('/analytics')} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg p-4 flex justify-between items-center transition-colors">
            <span className="font-medium">View Full Analytics Report</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {renderKPIs()}
      
      {user?.role === 'FLEET_MANAGER' && renderFleetManager()}
      {user?.role === 'DISPATCHER' && renderDispatcher()}
      {user?.role === 'SAFETY_OFFICER' && renderSafetyOfficer()}
      {user?.role === 'FINANCIAL_ANALYST' && renderFinancialAnalyst()}
    </div>
  )
}
