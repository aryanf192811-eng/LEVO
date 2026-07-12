import { useState } from 'react'
import { useMaintenance, useCloseMaintenance } from '@/api/hooks/useMaintenance'
import { useAuthStore } from '@/store/authStore'
import { Plus, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fmtDate, fmtCurrency } from '@/lib/utils'
import StatusBadge from '@/components/common/StatusBadge'
import MaintenanceForm from '@/components/maintenance/MaintenanceForm'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyMaintenance } from '@/components/common/EmptyState'

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

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={4} cols={7} />
        ) : logs.length === 0 ? (
          <EmptyMaintenance />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log: any) => (
                  <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 group relative ${log.status === 'ACTIVE' ? 'border-l-4 border-l-amber-500 bg-amber-50/10 dark:bg-amber-900/10' : 'border-l-4 border-l-transparent'}`}>
                    <td className="px-6 py-4">
                      <Link to={`/vehicles/${log.vehicleId}`} className="font-semibold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-500 hover:underline">
                        {log.vehicle?.regNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      {log.type}
                      {log.isAutoTriggered && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-500">Auto</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={log.description}>{log.description}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">{log.cost ? fmtCurrency(log.cost) : '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={log.status} /></td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{fmtDate(log.openedAt)}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{log.closedAt ? fmtDate(log.closedAt) : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'ACTIVE' && isFleetManager && (
                        <button onClick={() => handleClose(log.id)} className="text-xs font-medium px-3 py-1.5 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors flex items-center gap-1.5 ml-auto">
                          <CheckCircle className="w-3.5 h-3.5" /> Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MaintenanceForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
