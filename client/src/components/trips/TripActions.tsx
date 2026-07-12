import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Link } from 'react-router-dom'
import { useDispatchTrip, useCompleteTrip, useCancelTrip } from '@/api/hooks/useTrips'

interface TripActionsProps {
  trip: any
}

export default function TripActions({ trip }: TripActionsProps) {
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const dispatchMutation = useDispatchTrip()
  const cancelMutation = useCancelTrip()

  const handleDispatch = async () => {
    try {
      await dispatchMutation.mutateAsync(trip.id)
    } catch (e) {
      alert('Error dispatching trip')
    }
  }

  const handleCancel = async () => {
    if (confirm('Are you sure? This will release the vehicle and driver.')) {
      try {
        await cancelMutation.mutateAsync(trip.id)
      } catch (e) {
        alert('Error cancelling trip')
      }
    }
  }

  if (trip.status === 'DRAFT') {
    return (
      <button onClick={handleDispatch} className="text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors border border-blue-200">
        Dispatch
      </button>
    )
  }

  if (trip.status === 'DISPATCHED') {
    return (
      <div className="flex items-center gap-2">
        <button onClick={() => setCompleteModalOpen(true)} className="text-xs font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors border border-emerald-200">
          Complete
        </button>
        <button onClick={handleCancel} className="text-xs font-medium px-3 py-1.5 bg-white text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200">
          Cancel
        </button>
        <CompleteTripModal trip={trip} open={completeModalOpen} onClose={() => setCompleteModalOpen(false)} />
      </div>
    )
  }

  const isTripDetailPage = window.location.pathname === `/trips/${trip.id}`
  if (isTripDetailPage) return null

  return (
    <Link to={`/trips/${trip.id}`} className="text-xs font-medium text-slate-500 hover:text-slate-900 underline underline-offset-2">
      View
    </Link>
  )
}

function CompleteTripModal({ trip, open, onClose }: { trip: any, open: boolean, onClose: () => void }) {
  const [endOdometer, setEndOdometer] = useState<number | ''>('')
  const [revenue, setRevenue] = useState<number | ''>('')
  const completeMutation = useCompleteTrip()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!endOdometer || !revenue) return
    try {
      const res = await completeMutation.mutateAsync({ tripId: trip.id, data: { endOdometer: Number(endOdometer), revenue: Number(revenue) } })
      if (res.maintenanceTriggered) {
        alert(`⚠ Auto-Maintenance Triggered:\n${trip.vehicle?.name} has been sent for scheduled service.`)
      } else {
        alert('Trip completed successfully')
      }
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error completing trip')
    }
  }

  const startOdo = trip.startOdometer || 0
  const actualDistance = (typeof endOdometer === 'number' ? endOdometer : startOdo) - startOdo

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md z-50 p-6">
          <Dialog.Title className="text-lg font-semibold mb-4">Complete Trip</Dialog.Title>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">End Odometer (km)</label>
              <input 
                type="number" required min={startOdo + 1}
                value={endOdometer} onChange={e => setEndOdometer(e.target.value ? Number(e.target.value) : '')}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" 
              />
              <p className="text-xs text-slate-500 mt-1">Start odometer: {startOdo} km</p>
              {typeof endOdometer === 'number' && endOdometer > startOdo && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">Actual distance: {actualDistance} km</p>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Trip Revenue (₹)</label>
              <input 
                type="number" required min={0} placeholder="8500"
                value={revenue} onChange={e => setRevenue(e.target.value ? Number(e.target.value) : '')}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
              <button type="submit" disabled={completeMutation.isPending} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-md font-medium">
                Complete Trip
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
