import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import { useAddSafetyEvent } from '@/api/hooks/useDrivers'
import { getErrorMessage } from '@/lib/utils'

interface SafetyEventModalProps {
  open: boolean
  onClose: () => void
  driverId: number
  driverName: string
  currentScore: number
}

export default function SafetyEventModal({ open, onClose, driverId, driverName, currentScore }: SafetyEventModalProps) {
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState('')
  const mutation = useAddSafetyEvent()

  const newScore = Math.max(0, Math.min(100, currentScore + delta))
  const isPenalty = delta < 0
  const isPositive = delta > 0

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.length < 10) {
      alert('Reason must be at least 10 characters long.')
      return
    }
    if (delta === 0) {
      alert('Delta must be non-zero.')
      return
    }
    try {
      await mutation.mutateAsync({ driverId, delta, reason })
      alert(`Safety event recorded. New score: ${newScore}`)
      onClose()
      setDelta(0)
      setReason('')
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md z-50 p-6 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold text-slate-900">
              Log Safety Event
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          <p className="text-sm text-slate-500 mb-6">Record a safety event for <strong>{driverName}</strong>.</p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-[13px] font-medium text-slate-700">Score Adjustment</label>
                <span className={`text-lg font-bold ${isPenalty ? 'text-red-600' : isPositive ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              </div>
              <input 
                type="range" 
                min="-20" 
                max="10" 
                step="1" 
                value={delta}
                onChange={e => setDelta(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>-20 (Severe Penalty)</span>
                <span>+10 (Commendation)</span>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-600">Current Score: {currentScore}</span>
                <span className="text-sm font-semibold text-slate-900">New Score: {newScore}</span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Reason</label>
              <textarea 
                required 
                minLength={10}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Describe the safety event..."
                className="w-full h-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={mutation.isPending || delta === 0} className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Event
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
