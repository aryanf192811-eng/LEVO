import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fmtCurrency } from '@/lib/utils'

// 1. Cost Breakdown Chart (Stacked)
interface CostItem {
  vehicleName: string
  fuelCost: number
  maintenanceCost: number
  otherExpenses: number
  totalCost: number
}

export function CostBreakdownChart({ data }: { data: CostItem[] }) {
  if (!data?.length) return <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 rounded">No cost data</div>

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, p: any) => sum + Number(p.value), 0)
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-sm w-48">
          <p className="font-bold text-slate-900 mb-2 border-b pb-1">{label}</p>
          {payload.map((p: any) => (
            <div key={p.dataKey} className="flex justify-between items-center py-0.5">
              <span style={{ color: p.fill }} className="text-xs font-medium capitalize">{p.name}</span>
              <span className="font-semibold text-slate-900">{fmtCurrency(p.value)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">Total</span>
            <span className="font-bold text-slate-900">{fmtCurrency(total)}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="vehicleName" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `₹${v/1000}k`} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="fuelCost" name="Fuel" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} maxBarSize={40} />
          <Bar dataKey="maintenanceCost" name="Maintenance" stackId="a" fill="#f59e0b" maxBarSize={40} />
          <Bar dataKey="otherExpenses" name="Other" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 2. Monthly Revenue Chart (Simple)
interface RevenueItem {
  month: string
  revenue: number
  tripCount: number
}

export function MonthlyRevenueChart({ data }: { data: RevenueItem[] }) {
  if (!data?.length) return <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 rounded">No revenue data</div>

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-sm">
          <p className="font-bold text-slate-900 mb-1">{label}</p>
          <p className="text-emerald-600 font-bold text-lg">{fmtCurrency(p.revenue)}</p>
          <p className="text-xs text-slate-500 mt-1">{p.tripCount} trips completed</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `₹${v/1000}k`} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
          <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
