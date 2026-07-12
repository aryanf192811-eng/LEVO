import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useCreateMaintenance } from '@/api/hooks/useMaintenance'
import { useVehicles } from '@/api/hooks/useVehicles'
import { getErrorMessage } from '@/lib/utils'

interface MaintenanceFormProps {
  open: boolean
  onClose: () => void
}

export default function MaintenanceForm({ open, onClose }: MaintenanceFormProps) {
  const { data: vehicles = [] } = useVehicles()
  const createMutation = useCreateMaintenance()
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { vehicleId: '', type: 'Oil Change', description: '', cost: '', odometerAtService: '' }
  })

  const watchVid = watch('vehicleId')
  const selectedV = vehicles.find((v: any) => v.id === Number(watchVid))

  React.useEffect(() => {
    if (open) reset({ vehicleId: '', type: 'Oil Change', description: '', cost: '', odometerAtService: '' })
  }, [open, reset])

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        vehicleId: Number(data.vehicleId),
        cost: data.cost ? Number(data.cost) : undefined,
        odometerAtService: data.odometerAtService ? Number(data.odometerAtService) : undefined
      }
      await createMutation.mutateAsync(payload)
      alert('Maintenance record created. Vehicle status set to In Shop.')
      onClose()
    } catch (e) {
      alert(getErrorMessage(e))
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md z-50 p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">Log Maintenance</Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1">Select Vehicle</label>
              <select required {...register('vehicleId')} className="w-full h-10 px-3 border rounded-lg text-sm bg-white">
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.regNumber} — {v.name} ({v.status})</option>
                ))}
              </select>
            </div>

            {selectedV && selectedV.status !== 'IN_SHOP' && (
              <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded flex gap-2 items-start border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>⚠ Creating this record will set the vehicle's status to <strong>In Shop</strong>.</p>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium mb-1">Maintenance Type</label>
              <select {...register('type')} className="w-full h-10 px-3 border rounded-lg text-sm bg-white">
                {['Oil Change', 'Tyre Replacement', 'Engine Repair', 'Brake Service', 'Body Work', 'Electrical', 'Scheduled Service', 'Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium mb-1">Est. Cost (₹)</label>
                <input type="number" min="0" {...register('cost')} className="w-full h-10 px-3 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1">Odometer (km)</label>
                <input type="number" min="0" {...register('odometerAtService')} className="w-full h-10 px-3 border rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1">Description</label>
              <textarea required minLength={10} {...register('description')} className="w-full h-20 p-3 border rounded-lg text-sm resize-none" placeholder="Provide details..." />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded-lg flex items-center gap-2">
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin"/>} Save Record
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
