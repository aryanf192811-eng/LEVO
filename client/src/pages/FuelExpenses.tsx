import { useState } from 'react'
import { Plus } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useFuelLogs, useExpenses, useCreateFuelLog, useCreateExpense } from '@/api/hooks/useFinancial'
import { useVehicles } from '@/api/hooks/useVehicles'
import { fmtDate, fmtCurrency } from '@/lib/utils'

export default function FuelExpenses() {
  const [fuelOpen, setFuelOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)

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
            <button onClick={() => setFuelOpen(true)} className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"><Plus className="w-4 h-4"/> Log Fuel</button>
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
            <button onClick={() => setExpenseOpen(true)} className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"><Plus className="w-4 h-4"/> Add Expense</button>
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
      
      <LogFuelModal open={fuelOpen} onClose={() => setFuelOpen(false)} />
      <AddExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} />
    </div>
  )
}

function LogFuelModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { data: vehicles = [] } = useVehicles()
  const createFuel = useCreateFuelLog()

  const [vehicleId, setVehicleId] = useState('')
  const [litres, setLitres] = useState('')
  const [costPerLitre, setCostPerLitre] = useState('')
  const [odometerReading, setOdometerReading] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createFuel.mutateAsync({
        vehicleId: Number(vehicleId),
        litres: Number(litres),
        costPerLitre: Number(costPerLitre),
        odometerReading: Number(odometerReading),
        date: new Date(date).toISOString()
      })
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error logging fuel')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md z-50 p-6">
          <Dialog.Title className="text-lg font-semibold mb-4">Log Fuel</Dialog.Title>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Vehicle</label>
              <select required value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amber-500">
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNumber}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Litres</label>
                <input type="number" step="0.1" required value={litres} onChange={e => setLitres(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Cost / Litre</label>
                <input type="number" step="0.01" required value={costPerLitre} onChange={e => setCostPerLitre(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Odometer</label>
              <input type="number" required value={odometerReading} onChange={e => setOdometerReading(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Date</label>
              <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
              <button type="submit" disabled={createFuel.isPending} className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-md font-medium">Log Fuel</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function AddExpenseModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { data: vehicles = [] } = useVehicles()
  const createExpense = useCreateExpense()

  const [vehicleId, setVehicleId] = useState('')
  const [type, setType] = useState('Toll')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createExpense.mutateAsync({
        vehicleId: Number(vehicleId),
        type,
        amount: Number(amount),
        description,
        date: new Date(date).toISOString()
      })
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error adding expense')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md z-50 p-6">
          <Dialog.Title className="text-lg font-semibold mb-4">Add Expense</Dialog.Title>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Vehicle</label>
              <select required value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amber-500">
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNumber}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Type</label>
                <select required value={type} onChange={e => setType(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amber-500">
                  {['Toll', 'Parking', 'Fine', 'Loading', 'Unloading', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Description (Optional)</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Date</label>
              <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
              <button type="submit" disabled={createExpense.isPending} className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-md font-medium">Add Expense</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
