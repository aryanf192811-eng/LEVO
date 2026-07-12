import React from 'react'
import { Link } from 'react-router-dom'
import { fmtCurrency } from '@/lib/utils'

interface VehicleROIItem {
  vehicleId: number
  vehicleName: string
  acquisitionCost: number
  totalRevenue: number
  totalMaintenanceCost: number
  totalFuelCost: number
  roi: number
}

export default function ROITable({ data }: { data: VehicleROIItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-sm">No completed trips with revenue data yet</p>
      </div>
    )
  }

  // Sort by ROI descending
  const sortedData = [...data].sort((a, b) => b.roi - a.roi)

  const totals = sortedData.reduce((acc, row) => {
    acc.acquisition += row.acquisitionCost
    acc.revenue += row.totalRevenue
    acc.costs += row.totalMaintenanceCost + row.totalFuelCost
    return acc
  }, { acquisition: 0, revenue: 0, costs: 0 })

  const overallROI = totals.acquisition > 0 
    ? ((totals.revenue - totals.costs) / totals.acquisition) * 100 
    : 0

  const getRoiClass = (roi: number) => {
    if (roi > 0) return 'text-emerald-600 font-semibold'
    if (roi < 0) return 'text-red-600 font-semibold'
    return 'text-slate-500 font-medium'
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">Vehicle ROI Analysis</h3>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">
          ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost × 100
        </p>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 uppercase text-[11px] tracking-wider">Vehicle</th>
              <th className="px-4 py-3 uppercase text-[11px] tracking-wider text-right">Acquisition</th>
              <th className="px-4 py-3 uppercase text-[11px] tracking-wider text-right">Revenue</th>
              <th className="px-4 py-3 uppercase text-[11px] tracking-wider text-right">Op Costs</th>
              <th className="px-4 py-3 uppercase text-[11px] tracking-wider text-right">ROI %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedData.map((row) => (
              <tr key={row.vehicleId} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/vehicles/${row.vehicleId}`} className="font-semibold text-slate-900 hover:text-amber-600">
                    {row.vehicleName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-slate-500">{fmtCurrency(row.acquisitionCost)}</td>
                <td className="px-4 py-3 text-right text-emerald-700 font-medium">{fmtCurrency(row.totalRevenue)}</td>
                <td className="px-4 py-3 text-right text-amber-700 font-medium">{fmtCurrency(row.totalMaintenanceCost + row.totalFuelCost)}</td>
                <td className={`px-4 py-3 text-right ${getRoiClass(row.roi)}`}>
                  {row.roi > 0 ? '+' : ''}{row.roi.toFixed(1)}%
                </td>
              </tr>
            ))}
            
            {/* Footer Row */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <td className="px-4 py-3 text-slate-900">FLEET TOTAL</td>
              <td className="px-4 py-3 text-right text-slate-700">{fmtCurrency(totals.acquisition)}</td>
              <td className="px-4 py-3 text-right text-emerald-700">{fmtCurrency(totals.revenue)}</td>
              <td className="px-4 py-3 text-right text-amber-700">{fmtCurrency(totals.costs)}</td>
              <td className={`px-4 py-3 text-right ${getRoiClass(overallROI)}`}>
                {overallROI > 0 ? '+' : ''}{overallROI.toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
