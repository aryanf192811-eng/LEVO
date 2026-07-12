import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDriverDetail } from '@/api/hooks/useDrivers'
import { ArrowLeft, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import SafetyEventModal from '@/components/drivers/SafetyEventModal'
import { licenseExpiryClass, statusToBadge } from '@/lib/utils'

export default function DriverDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { data: driver, isLoading } = useDriverDetail(Number(id))
  
  const [showSafetyModal, setShowSafetyModal] = useState(false)

  if (isLoading) return <div className="p-8 animate-pulse text-slate-400">Loading profile...</div>
  if (!driver) return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Driver not found</h2>
      <button onClick={() => navigate('/drivers')} className="text-amber-600 flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Back</button>
    </div>
  )

  const isSafetyOfficer = user?.role === 'SAFETY_OFFICER'
  const isFleetManager = user?.role === 'FLEET_MANAGER'

  const getSafetyChartData = () => {
    if (!driver.safetyEvents?.length) return []
    let currentScore = driver.safetyScore
    const events = [...driver.safetyEvents].reverse() // chronological
    const chartData = events.map(e => {
      const point = { date: new Date(e.createdAt).toLocaleDateString(), score: currentScore, reason: e.reason }
      currentScore -= e.delta
      return point
    }).reverse() // back to chronological for chart
    return chartData
  }
  const chartData = getSafetyChartData()
  const scoreColor = driver.safetyScore > 70 ? 'text-emerald-500' : driver.safetyScore > 40 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-12">
      <button onClick={() => navigate('/drivers')} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4"/> Back to Drivers
      </button>

      {/* HEADER PROFILE CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-3xl shrink-0 border-4 border-white shadow-sm">
            {driver.name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{driver.name}</h1>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold tracking-wider">{driver.licenseCategory}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusToBadge(driver.status)}`}>{driver.status.replace('_', ' ')}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">License:</span>
                <span className="font-mono font-medium text-slate-900">{driver.licenseNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-900">{driver.contactNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Expiry:</span>
                <span className={`font-semibold ${licenseExpiryClass(driver.licenseExpiry)}`}>
                  {new Date(driver.licenseExpiry).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray={`${(driver.safetyScore / 100) * 283} 283`}
                className={`transition-all duration-1000 ${scoreColor}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900 tracking-tighter">{driver.safetyScore}</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-2">Safety Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SAFETY SCORE HISTORY */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-900">Safety History</h3>
              {isSafetyOfficer && (
                <button onClick={() => setShowSafetyModal(true)} className="text-sm font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                  + Log Event
                </button>
              )}
            </div>
            
            {chartData.length > 0 ? (
              <div className="h-[200px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} width={30} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      formatter={(value: number) => [`${value} pts`, 'Score']}
                    />
                    <Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={3} dot={{r: 4, fill: '#0f172a', strokeWidth: 0}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm py-12">
                <ShieldAlert className="w-8 h-8 mb-3 opacity-20" />
                <p>No safety events recorded.</p>
              </div>
            )}
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {driver.safetyEvents?.map(e => (
                <div key={e.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${e.delta > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {e.delta > 0 ? '+' : ''}{e.delta}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 leading-snug">{e.reason}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(e.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TRIP HISTORY */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900">Recent Trips</h3>
              <span className="text-sm text-slate-500">{driver.trips?.length || 0} total trips</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Cargo</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {driver.trips?.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 group">
                      <td className="px-6 py-4">
                        <Link to={`/trips/${t.id}`} className="font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
                          {t.source} → {t.destination}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">{t.cargoWeightKg} kg</td>
                      <td className="px-6 py-4 text-right text-emerald-700 font-medium">₹{(t.revenue || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusToBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!driver.trips || driver.trips.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No trips completed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <SafetyEventModal 
        open={showSafetyModal} 
        onClose={() => setShowSafetyModal(false)}
        driverId={driver.id}
        driverName={driver.name}
        currentScore={driver.safetyScore}
      />
    </div>
  )
}
