import { useState } from 'react'
import { useMaintenance, useCloseMaintenance } from '@/api/hooks/useMaintenance'
import { useAuthStore } from '@/store/authStore'
import { Plus, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fmtDate, fmtCurrency } from '@/lib/utils'
import StatusBadge from '@/components/common/StatusBadge'
import MaintenanceForm from '@/components/maintenance/MaintenanceForm'

export default function Maintenance() {
  const user = useAuthStore(s => s.user)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const { data: logs = [], isLoading } = useMaintenance({ status: statusFilter === 'ALL' ? undefined : statusFilter })
  const closeMutation = useCloseMaintenance()
  const [showForm, setShowForm] = useState(false)

  const handleClose = async (id: number) => {
    if (confirm('Close this maintenance record? Vehicle will be restored to Available.')) {
      await closeMutation.mutateAsync(id)
      alert('Maintenance closed. Vehicle is now Available.')
    }
  }

  const isFleetManager = user?.role === 'FLEET_MANAGER'

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Logs</h1>
          <p className="text-slate-500 mt-1">Vehicle service and repair records</p>
        </div>
        {isFleetManager && (
          <button onClick={() => setShowForm(true)} className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Record
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {['ALL', 'ACTIVE', 'CLOSED'].map(tab => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === tab ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 uppercase text-[12px] tracking-wider">Vehicle</th>
              <th className="px-6 py-3 uppercase text-[12px] tracking-wider">Type</th>
              <th className="px-6 py-3 uppercase text-[12px] tracking-wider">Description</th>
              <th className="px-6 py-3 uppercase text-[12px] tracking-wider text-right">Cost</th>
              <th className="px-6 py-3 uppercase text-[12px] tracking-wider">Status</th>
              <th className="px-6 py-3 uppercase text-[12px] tracking-wider">Opened</th>
              <th className="px-6 py-3 uppercase text-[12px] tracking-wider">Closed</th>
              <th className="px-6 py-3 uppercase text-[12px] tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={8} className="p-12 text-center text-slate-500">No maintenance logs found</td></tr>
            ) : logs.map((log: any) => (
              <tr key={log.id} className={`hover:bg-slate-50 group relative ${log.status === 'ACTIVE' ? 'border-l-4 border-l-amber-500 bg-amber-50/10' : 'border-l-4 border-l-transparent'}`}>
                <td className="px-6 py-4">
                  <Link to={`/vehicles/${log.vehicleId}`} className="font-semibold text-slate-900 hover:text-amber-600 hover:underline">
                    {log.vehicle?.regNumber}
                  </Link>
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium">
                  {log.type}
                  {log.isAutoTriggered && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Auto</span>}
                </td>
                <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]" title={log.description}>{log.description}</td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">{log.cost ? fmtCurrency(log.cost) : '—'}</td>
                <td className="px-6 py-4"><StatusBadge status={log.status} /></td>
                <td className="px-6 py-4 text-slate-500">{fmtDate(log.openedAt)}</td>
                <td className="px-6 py-4 text-slate-500">{log.closedAt ? fmtDate(log.closedAt) : '—'}</td>
                <td className="px-6 py-4 text-right">
                  {log.status === 'ACTIVE' && isFleetManager && (
                    <button onClick={() => handleClose(log.id)} className="text-xs font-medium px-3 py-1.5 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-1.5 ml-auto">
                      <CheckCircle className="w-3.5 h-3.5" /> Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MaintenanceForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
