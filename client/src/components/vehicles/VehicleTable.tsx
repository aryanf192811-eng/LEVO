import { MoreHorizontal, Truck, Plus } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Vehicle } from '@/types'
import { Link, useNavigate } from 'react-router-dom'
import { statusToBadge } from '@/lib/utils'

interface VehicleTableProps {
  vehicles: Vehicle[]
  isLoading: boolean
  onEdit: (v: Vehicle) => void
  onDelete: (id: number) => void
}

const fmtNumber = (num: number, decimals = 0) => num.toLocaleString('en-IN', { maximumFractionDigits: decimals })
const fmtCurrency = (num: number) => '₹' + num.toLocaleString('en-IN')

export default function VehicleTable({ vehicles, isLoading, onEdit, onDelete }: VehicleTableProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full">
        <div className="space-y-4 p-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-10 bg-slate-100 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Truck className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No vehicles found</h3>
        <p className="text-slate-500 mb-4">Add your first vehicle or adjust filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Registration No</th>
              <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Vehicle Name</th>
              <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Type</th>
              <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider text-right">Max Load</th>
              <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider text-right">Odometer</th>
              <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider text-left">Acq. Cost</th>
              <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider">Status</th>
              <th className="px-6 py-3 font-semibold uppercase text-[12px] tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors group h-14">
                <td className="px-6 py-3">
                  <span className="font-mono font-semibold text-slate-900">{v.regNumber}</span>
                </td>
                <td className="px-6 py-3 font-medium text-slate-700">{v.name}</td>
                <td className="px-6 py-3 text-slate-500">{v.type}</td>
                <td className="px-6 py-3 text-right font-medium text-slate-700">{fmtNumber(v.maxCapacityKg)} kg</td>
                <td className="px-6 py-3 text-right text-slate-600">{fmtNumber(v.currentOdometer)} km</td>
                <td className="px-6 py-3 text-slate-600">{fmtCurrency(v.acquisitionCost)}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusToBadge(v.status)}`}>
                    {v.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all outline-none">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="end" className="w-40 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 p-1">
                        <DropdownMenu.Item onSelect={() => navigate(`/vehicles/${v.id}`)} className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-600 rounded cursor-pointer outline-none transition-colors">
                          View Details
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onSelect={() => onEdit(v)} className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer outline-none transition-colors">
                          Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                        <DropdownMenu.Item onSelect={() => {
                          if (confirm('Are you sure you want to delete this vehicle?')) onDelete(v.id)
                        }} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none transition-colors font-medium">
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
