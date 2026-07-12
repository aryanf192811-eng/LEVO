import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatchableVehicles, useDispatchableDrivers, useCreateTrip } from '@/api/hooks/useTrips'
import { useWeatherAssessment } from '@/api/hooks/useTrips'
import WeatherPanel from '@/components/trips/WeatherPanel'
import { getErrorMessage, fmtDate } from '@/lib/utils'

interface TripFormProps {
  open: boolean
  onClose: () => void
}

const formSchema = z.object({
  vehicleId: z.number({ required_error: 'Select a vehicle' }),
  driverId: z.number({ required_error: 'Select a driver' }),
  source: z.string().min(2, 'Enter source city'),
  destination: z.string().min(2, 'Enter destination city'),
  cargoWeightKg: z.number().min(0.1, 'Cargo weight required'),
  plannedDistanceKm: z.number().min(0.1, 'Distance required'),
  notes: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

export default function TripForm({ open, onClose }: TripFormProps) {
  const { data: vehicles = [] } = useDispatchableVehicles()
  const { data: drivers = [] } = useDispatchableDrivers()
  const createMutation = useCreateTrip()

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cargoWeightKg: 0,
      plannedDistanceKm: 0,
    }
  })

  useEffect(() => {
    if (open) {
      reset({ cargoWeightKg: 0, plannedDistanceKm: 0, source: '', destination: '', notes: '' })
    }
  }, [open, reset])

  const watchVid = watch('vehicleId')
  const watchDid = watch('driverId')
  const watchSrc = watch('source')
  const watchDest = watch('destination')
  const watchCargo = watch('cargoWeightKg') || 0

  const selectedVehicle = vehicles.find((v: any) => v.id === Number(watchVid))
  const selectedDriver = drivers.find((d: any) => d.id === Number(watchDid))

  // Debounced source/dest for weather
  const [debouncedSrc, setDebouncedSrc] = useState('')
  const [debouncedDest, setDebouncedDest] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSrc(watchSrc || '')
      setDebouncedDest(watchDest || '')
    }, 800)
    return () => clearTimeout(t)
  }, [watchSrc, watchDest])

  // Get weather to include in submission
  const { data: weather } = useWeatherAssessment(debouncedSrc, debouncedDest, debouncedSrc.length > 2 && debouncedDest.length > 2)

  const onSubmit = async (data: FormData) => {
    if (selectedVehicle && data.cargoWeightKg > selectedVehicle.maxCapacityKg) {
      alert('Cannot create trip: Cargo exceeds vehicle capacity')
      return
    }

    try {
      const payload = {
        ...data,
        weatherRiskLevel: weather?.risk?.risk_level,
        weatherRec: weather?.risk?.recommendation,
      }
      await createMutation.mutateAsync(payload)
      alert('Trip created successfully')
      onClose()
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  // Cargo capacity logic
  const capacityPct = selectedVehicle ? Math.min(100, (watchCargo / selectedVehicle.maxCapacityKg) * 100) : 0
  const overloaded = selectedVehicle && watchCargo > selectedVehicle.maxCapacityKg
  const excess = selectedVehicle ? watchCargo - selectedVehicle.maxCapacityKg : 0

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-2xl z-50 p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
            <Dialog.Title className="text-xl font-semibold text-slate-900">
              Create New Trip
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* SELECTORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Assign Vehicle</label>
                <select {...register('vehicleId', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amber-500">
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} — {v.name} ({v.type}) | {v.maxCapacityKg}kg
                    </option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-red-500 text-xs mt-1">{errors.vehicleId.message}</p>}
                
                {selectedVehicle && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Vehicle:</span> {selectedVehicle.name} <br/>
                    <span className="font-semibold text-slate-800">Max Capacity:</span> {selectedVehicle.maxCapacityKg} kg <br/>
                    <span className="font-semibold text-slate-800">Odometer:</span> {selectedVehicle.currentOdometer} km
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Assign Driver</label>
                <select {...register('driverId', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amber-500">
                  <option value="">-- Select Driver --</option>
                  {drivers.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.licenseCategory} | Score: {d.safetyScore}
                    </option>
                  ))}
                </select>
                {errors.driverId && <p className="text-red-500 text-xs mt-1">{errors.driverId.message}</p>}
                
                {selectedDriver && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Safety Score:</span> {selectedDriver.safetyScore} <br/>
                    <span className="font-semibold text-slate-800">License Expiry:</span> {fmtDate(selectedDriver.licenseExpiry)}
                    {new Date(selectedDriver.licenseExpiry).getTime() - Date.now() < 30 * 86400000 && (
                      <div className="text-amber-600 font-medium mt-1">⚠ License expires in {'<'}30 days</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ROUTE & CARGO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">Source City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register('source')} className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" placeholder="e.g. Mumbai" />
                  </div>
                  {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">Destination City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register('destination')} className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" placeholder="e.g. Pune" />
                  </div>
                  {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">Planned Distance (km)</label>
                  <input type="number" step="0.1" {...register('plannedDistanceKm', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
                  {errors.plannedDistanceKm && <p className="text-red-500 text-xs mt-1">{errors.plannedDistanceKm.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1">Cargo Weight (kg)</label>
                  <input type="number" step="0.1" {...register('cargoWeightKg', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-500" />
                  {errors.cargoWeightKg && <p className="text-red-500 text-xs mt-1">{errors.cargoWeightKg.message}</p>}
                  
                  {/* LIVE VALIDATOR */}
                  {selectedVehicle && (
                    <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex justify-between text-[11px] mb-1.5 font-medium text-slate-600">
                        <span>Load: {watchCargo || 0} kg</span>
                        <span>Max: {selectedVehicle.maxCapacityKg} kg</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${overloaded ? 'bg-red-500' : 'bg-emerald-500'}`}
                             style={{ width: `${capacityPct}%` }} />
                      </div>
                      {overloaded
                        ? <p className="text-red-600 text-xs mt-1.5 font-medium">✗ Exceeds capacity by {excess.toFixed(0)} kg — will be rejected</p>
                        : <p className="text-emerald-600 text-xs mt-1.5 font-medium">✓ Within capacity ({(watchCargo||0)}/{selectedVehicle.maxCapacityKg} kg)</p>
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* WEATHER PANEL */}
            <WeatherPanel source={debouncedSrc} destination={debouncedDest} />

            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white pb-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createMutation.isPending || overloaded} className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Trip
              </button>
            </div>

          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
