import { useState, useEffect } from 'react'
import { Plus, Search, ChevronDown, Info } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useVehicles, useDeleteVehicle } from '@/api/hooks/useVehicles'
import VehicleTable from '@/components/vehicles/VehicleTable'
import VehicleForm from '@/components/vehicles/VehicleForm'
import { Vehicle } from '@/types'

export default function Vehicles() {
  const user = useAuthStore(s => s.user)
  const [filters, setFilters] = useState({ status: '', type: '', region: '', search: '' })
  const [searchInput, setSearchInput] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: vehicles = [], isLoading } = useVehicles(filters)
  const deleteMutation = useDeleteVehicle()

  const hasActiveFilters = filters.status || filters.type || filters.region || filters.search

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet</h1>
          <p className="text-slate-500 mt-1">{vehicles.length} vehicles</p>
        </div>
        {user?.role === 'FLEET_MANAGER' && (
          <button 
            onClick={() => { setEditingVehicle(undefined); setShowForm(true) }}
            className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2 mb-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search registration or name..." 
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border-transparent hover:border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-colors bg-slate-50"
          />
        </div>
        
        <select 
          value={filters.type} 
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
          className="h-9 px-3 rounded-md border-transparent hover:border-slate-200 bg-slate-50 text-sm text-slate-700 cursor-pointer focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
        >
          <option value="">All Types</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Bike">Bike</option>
          <option value="Car">Car</option>
          <option value="Bus">Bus</option>
        </select>

        <select 
          value={filters.status} 
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="h-9 px-3 rounded-md border-transparent hover:border-slate-200 bg-slate-50 text-sm text-slate-700 cursor-pointer focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="IN_SHOP">In Shop</option>
          <option value="RETIRED">Retired</option>
        </select>

        <select 
          value={filters.region} 
          onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
          className="h-9 px-3 rounded-md border-transparent hover:border-slate-200 bg-slate-50 text-sm text-slate-700 cursor-pointer focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
        >
          <option value="">All Regions</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="Central">Central</option>
        </select>

        {hasActiveFilters && (
          <button 
            onClick={() => { setFilters({ status: '', type: '', region: '', search: '' }); setSearchInput(''); }}
            className="text-xs font-medium text-amber-600 hover:text-amber-700 px-3"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
        <Info className="w-4 h-4 text-slate-400" />
        <p>Retired and In Shop vehicles are automatically excluded from trip dispatch.</p>
      </div>

      {/* TABLE */}
      <VehicleTable 
        vehicles={vehicles} 
        isLoading={isLoading} 
        onEdit={(v) => { setEditingVehicle(v); setShowForm(true); }}
        onDelete={(id) => deleteMutation.mutate(id)}
        onAdd={user?.role === 'FLEET_MANAGER' ? () => { setEditingVehicle(undefined); setShowForm(true) } : undefined}
      />

      {/* FORM MODAL */}
      <VehicleForm 
        open={showForm} 
        onClose={() => setShowForm(false)} 
        vehicle={editingVehicle} 
      />

    </div>
  )
}
