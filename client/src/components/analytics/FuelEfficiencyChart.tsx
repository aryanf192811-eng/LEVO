import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CloudOff } from 'lucide-react'

interface FuelEfficiencyItem {
  vehicleId: number
  vehicleName: string
  totalDistance: number
  totalLitres: number
  efficiencyKmPerLitre: number
}

export default function FuelEfficiencyChart({ data }: { data: FuelEfficiencyItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
        <CloudOff className="w-8 h-8 mb-3 opacity-20" />
        <p className="text-sm">No trip data available for efficiency calculation</p>
      </div>
    )
  }

  // Sort by efficiency descending
  const sortedData = [...data].sort((a, b) => b.efficiencyKmPerLitre - a.efficiencyKmPerLitre)
  const height = Math.max(300, sortedData.length * 48 + 60)

  const getBarColor = (eff: number) => {
    if (eff >= 10) return '#10b981' // emerald
    if (eff >= 5) return '#f59e0b'  // amber
    return '#ef4444'                // red
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-sm">
          <p className="font-bold text-slate-900 mb-1">{p.vehicleName}</p>
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{p.efficiencyKmPerLitre.toFixed(1)} km/L</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ({p.totalDistance.toFixed(0)} km / {p.totalLitres.toFixed(0)} L)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <YAxis dataKey="vehicleName" type="category" tick={{fontSize: 11, fill: '#475569'}} axisLine={false} tickLine={false} width={80} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
          <Bar dataKey="efficiencyKmPerLitre" radius={[0, 4, 4, 0]} barSize={24}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.efficiencyKmPerLitre)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
