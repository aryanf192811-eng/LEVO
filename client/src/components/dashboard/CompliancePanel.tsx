import { Driver } from '@/types'
import { AlertCircle, ShieldAlert, Award } from 'lucide-react'

interface CompliancePanelProps {
  expiring?: Driver[]
  suspended?: Driver[]
  leaderboard?: Driver[]
}

export default function CompliancePanel({ expiring = [], suspended = [], leaderboard = [] }: CompliancePanelProps) {
  // Mock data if props not provided (stub for F6)
  const expiringDrivers = expiring.length ? expiring : [
    { id: '1', name: 'Dev Malhotra', licenseCategory: 'CDL-A', licenseExpiry: new Date(Date.now() + 5 * 86400000).toISOString() }, // 5 days
    { id: '2', name: 'John Doe', licenseCategory: 'Class B', licenseExpiry: new Date(Date.now() + 20 * 86400000).toISOString() }, // 20 days
  ] as Driver[]

  const suspendedDrivers = suspended.length ? suspended : [
    { id: '3', name: 'Mike Smith', status: 'SUSPENDED' }
  ] as Driver[]

  const getDaysUntil = (dateStr: string) => {
    const diffTime = Math.abs(new Date(dateStr).getTime() - Date.now())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Expiring Licenses */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">License Expiry Alerts</h3>
        </div>
        <div className="space-y-3">
          {expiringDrivers.map(d => {
            const days = getDaysUntil(d.licenseExpiry)
            const isCritical = days < 7
            return (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.licenseCategory}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {days} days left
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Items */}
      <div className="space-y-6">
        <div className="bg-red-50 rounded-lg border border-red-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Suspended Drivers</h3>
          </div>
          <div className="text-3xl font-bold text-red-700 mb-2">{suspendedDrivers.length}</div>
          <div className="space-y-1">
            {suspendedDrivers.map(d => (
              <p key={d.id} className="text-sm text-red-800 font-medium">{d.name}</p>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900">Top Safety Scores</h3>
          </div>
          <div className="text-sm text-slate-500">Leaderboard data pending (F6)</div>
        </div>
      </div>

    </div>
  )
}
