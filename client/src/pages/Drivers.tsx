import { useState, useEffect } from 'react'
import { Plus, Search, AlertTriangle, MoreHorizontal, User } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDrivers, useExpiringDrivers, useSuspendDriver, useReinstateDriver } from '@/api/hooks/useDrivers'
import DriverForm from '@/components/drivers/DriverForm'
import { Driver } from '@/types'
import { statusToBadge, licenseExpiryClass } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyDrivers } from '@/components/common/EmptyState'

export default function Drivers() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  
  const [filters, setFilters] = useState({ status: 'All', licenseCategory: '', search: '' })
  const [searchInput, setSearchInput] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>()

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const apiFilters = {
    ...filters,
    status: filters.status === 'All' ? undefined : filters.status === 'Off Duty' ? 'OFF_DUTY' : filters.status.toUpperCase().replace(' ', '_')
  }

  const { data: drivers = [], isLoading } = useDrivers(apiFilters)
  const { data: expiringDrivers = [] } = useExpiringDrivers()
  
  const suspendMutation = useSuspendDriver()
  const reinstateMutation = useReinstateDriver()

  const handleSuspend = async (driver: Driver) => {
    const reason = prompt(`Reason for suspending ${driver.name}:`)
    if (reason) {
      await suspendMutation.mutateAsync({ driverId: driver.id, reason })
    }
  }
  const handleReinstate = async (driver: Driver) => {
    if (confirm(`Reinstate ${driver.name}?`)) {
      await reinstateMutation.mutateAsync(driver.id)
    }
  }

  const canEdit = user?.role === 'FLEET_MANAGER' || user?.role === 'SAFETY_OFFICER'

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-12">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Drivers</h1>
          <p className="text-slate-500 mt-1">{drivers.length} drivers</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => { setEditingDriver(undefined); setShowForm(true) }}
            className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        )}
      </div>

      {/* COMPLIANCE BANNER */}
      {expiringDrivers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="text-amber-500 w-5 h-5" />
          <span className="text-amber-700 text-sm font-medium">
            {expiringDrivers.length} driver(s) have licenses expiring within 30 days
          </span>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Available', 'On Trip', 'Off Duty', 'Suspended'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilters(f => ({ ...f, status: tab }))}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.status === tab 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2 mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name or license..." 
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border-transparent hover:border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-colors bg-slate-50"
          />
        </div>
        
        <select 
          value={filters.licenseCategory} 
          onChange={e => setFilters(f => ({ ...f, licenseCategory: e.target.value }))}
          className="h-9 px-3 rounded-md border-transparent hover:border-slate-200 bg-slate-50 text-sm text-slate-700 cursor-pointer focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
        >
          <option value="">All Categories</option>
          <option value="LMV">LMV</option>
          <option value="HMV">HMV</option>
          <option value="MCW">MCW</option>
          <option value="TRANS">TRANS</option>
        </select>
      </div>

      {/* CONTENT */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : drivers.length === 0 ? (
          <EmptyDrivers onAdd={canEdit ? () => { setEditingDriver(undefined); setShowForm(true) } : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Driver</th>
                  <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">License #</th>
                  <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Category</th>
                  <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Expiry</th>
                  <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Safety Score</th>
                  <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Status</th>
                  <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {drivers.map(d => {
                  const barColorClass = d.safetyScore > 70 ? 'bg-emerald-500' : d.safetyScore > 40 ? 'bg-amber-500' : 'bg-red-500'
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group h-16">
                      <td className="px-6 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                          {d.name.substring(0,2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{d.name}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{d.licenseNumber}</td>
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-500">{d.licenseCategory}</td>
                      <td className="px-6 py-3">
                        <span className={`text-[13px] font-medium ${licenseExpiryClass(d.licenseExpiry)}`}>
                          {new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3 w-32">
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${barColorClass}`} style={{ width: `${d.safetyScore}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-6">{d.safetyScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusToBadge(d.status)}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {canEdit && (
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all outline-none">
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content align="end" className="w-40 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 p-1">
                                <DropdownMenu.Item onSelect={() => navigate(`/drivers/${d.id}`)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-500 rounded cursor-pointer outline-none">
                                  View Details
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onSelect={() => { setEditingDriver(d); setShowForm(true) }} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer outline-none">
                                  Edit Driver
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                {d.status === 'AVAILABLE' && (
                                  <DropdownMenu.Item onSelect={() => handleSuspend(d)} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer outline-none font-medium">
                                    Suspend
                                  </DropdownMenu.Item>
                                )}
                                {d.status === 'SUSPENDED' && (
                                  <DropdownMenu.Item onSelect={() => handleReinstate(d)} className="px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded cursor-pointer outline-none font-medium">
                                    Reinstate
                                  </DropdownMenu.Item>
                                )}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DriverForm open={showForm} onClose={() => setShowForm(false)} driver={editingDriver} />

    </div>
  )
}
