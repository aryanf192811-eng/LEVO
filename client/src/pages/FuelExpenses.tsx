import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFuelLogs, useExpenses } from '@/api/hooks/useFinancial'
import { fmtDate, fmtCurrency } from '@/lib/utils'

export default function FuelExpenses() {
  const { data: fuelLogs = [], isLoading: loadFuel } = useFuelLogs()
  const { data: expenses = [], isLoading: loadExp } = useExpenses()
  
  const totalFuel = fuelLogs.reduce((acc, f) => acc + (f.totalCost || 0), 0)
  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0)
  const grandTotal = totalFuel + totalExpense

  const typeChipColors: Record<string, string> = {
    Toll: 'bg-blue-100 text-blue-700',
    Fine: 'bg-red-100 text-red-700',
    Loading: 'bg-amber-100 text-amber-700',
    Parking: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-32">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fuel & Expenses</h1>
        <p className="text-slate-500 mt-1">Operational cost tracking across the fleet</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* FUEL LOGS */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Fuel Logs</h2>
            <button className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"><Plus className="w-4 h-4"/> Log Fuel</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vehicle</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Vol (L)</th>
                  <th className="px-4 py-3 font-semibold text-right">Cost</th>
                  <th className="px-4 py-3 font-semibold">Trip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadFuel ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : fuelLogs.map((f: any) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{f.vehicle?.regNumber}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(f.date)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{f.litres} @ ₹{f.costPerLitre}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{fmtCurrency(f.totalCost)}</td>
                    <td className="px-4 py-3 text-slate-500">{f.tripId ? `#${f.tripId}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPENSES */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Other Expenses</h2>
            <button className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"><Plus className="w-4 h-4"/> Add Expense</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Vehicle</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold">Desc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadExp ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : expenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{fmtDate(e.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{e.vehicle?.regNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeChipColors[e.type] || 'bg-gray-100 text-gray-700'}`}>{e.type}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{fmtCurrency(e.amount)}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[120px] truncate" title={e.description}>{e.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* COST SUMMARY BAR */}
      <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between px-8">
        <div className="flex items-center gap-6 text-slate-700">
          <span className="text-sm">Fuel: <strong className="text-slate-900 text-lg ml-1">{fmtCurrency(totalFuel)}</strong></span>
          <span className="text-slate-300 text-xl font-light">+</span>
          <span className="text-sm">Maintenance & Other: <strong className="text-slate-900 text-lg ml-1">{fmtCurrency(totalExpense)}</strong></span>
          <span className="text-slate-300 text-xl font-light">=</span>
          <span className="text-sm uppercase tracking-wide font-semibold text-emerald-700">
            Total OPEX: <strong className="text-xl ml-1">{fmtCurrency(grandTotal)}</strong>
          </span>
        </div>
        <a href="/api/dashboard/export/csv?type=expenses" download className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
          Export CSV
        </a>
      </div>
    </div>
  )
}
