import React, { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Vehicle } from '@/types'
import { useCreateVehicle, useUpdateVehicle } from '@/api/hooks/useVehicles'
import { getErrorMessage } from '@/lib/utils'

interface VehicleFormProps {
  open: boolean
  onClose: () => void
  vehicle?: Vehicle
}

const formSchema = z.object({
  regNumber: z.string().min(1, 'Required').max(20),
  name: z.string().min(1, 'Required'),
  type: z.enum(['Van', 'Truck', 'Bike', 'Car', 'Bus']),
  maxCapacityKg: z.number().min(1, 'Must be at least 1'),
  currentOdometer: z.number().min(0).optional(),
  acquisitionCost: z.number().min(0, 'Must be positive'),
  region: z.enum(['North', 'South', 'East', 'West', 'Central']),
  serviceIntervalKm: z.number().min(100).optional()
})

type FormData = z.infer<typeof formSchema>

export default function VehicleForm({ open, onClose, vehicle }: VehicleFormProps) {
  const isEdit = !!vehicle
  const createMutation = useCreateVehicle()
  const updateMutation = useUpdateVehicle(vehicle?.id ?? 0)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'Truck',
      region: 'North',
      maxCapacityKg: 1000,
      acquisitionCost: 0,
      currentOdometer: 0,
    }
  })

  useEffect(() => {
    if (open) {
      if (vehicle) {
        reset({
          regNumber: vehicle.regNumber,
          name: vehicle.name,
          type: vehicle.type as any,
          maxCapacityKg: vehicle.maxCapacityKg,
          currentOdometer: vehicle.currentOdometer,
          acquisitionCost: vehicle.acquisitionCost,
          region: vehicle.region as any,
          serviceIntervalKm: vehicle.serviceIntervalKm || undefined
        })
      } else {
        reset({ type: 'Truck', region: 'North', maxCapacityKg: 1000, acquisitionCost: 0, currentOdometer: 0 })
      }
    }
  }, [open, vehicle, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose()
      // Note: toast success ideally goes here
      alert(isEdit ? 'Vehicle updated' : 'Vehicle created')
    } catch (err) {
      alert(getErrorMessage(err)) // stub for toast
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-lg z-50 p-6 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-slate-900">
              {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Registration Number</label>
                <input {...register('regNumber')} placeholder="MH-04-AB-1234" className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                {errors.regNumber && <p className="text-red-500 text-xs mt-1">{errors.regNumber.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Vehicle Name / Model</label>
                <input {...register('name')} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Vehicle Type</label>
                <select {...register('type')} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  {['Van', 'Truck', 'Bike', 'Car', 'Bus'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Region</label>
                <select {...register('region')} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  {['North', 'South', 'East', 'West', 'Central'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Max Load Capacity (kg)</label>
                <input type="number" {...register('maxCapacityKg', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                {errors.maxCapacityKg && <p className="text-red-500 text-xs mt-1">{errors.maxCapacityKg.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Current Odometer (km)</label>
                <input type="number" {...register('currentOdometer', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Acquisition Cost (₹)</label>
                <input type="number" {...register('acquisitionCost', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                {errors.acquisitionCost && <p className="text-red-500 text-xs mt-1">{errors.acquisitionCost.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Service Interval (km)</label>
                <input type="number" {...register('serviceIntervalKm', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                <p className="text-[11px] text-slate-500 mt-1">Auto-maintenance triggers when odometer exceeds this interval</p>
                {errors.serviceIntervalKm && <p className="text-red-500 text-xs mt-1">{errors.serviceIntervalKm.message}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Vehicle'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
