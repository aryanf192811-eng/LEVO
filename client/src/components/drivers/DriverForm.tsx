import React, { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Driver } from '@/types'
import { useCreateDriver, useUpdateDriver } from '@/api/hooks/useDrivers'
import { getErrorMessage } from '@/lib/utils'

interface DriverFormProps {
  open: boolean
  onClose: () => void
  driver?: Driver
}

const formSchema = z.object({
  name: z.string().min(1, 'Required'),
  licenseNumber: z.string().min(1, 'Required').max(30),
  licenseCategory: z.enum(['LMV', 'HMV', 'MCW', 'TRANS', 'HTV']),
  licenseExpiry: z.string().refine(d => new Date(d) > new Date(), 'Expiry must be in the future'),
  contactNumber: z.string().min(1, 'Required'),
  safetyScore: z.number().min(0).max(100).optional()
})

type FormData = z.infer<typeof formSchema>

export default function DriverForm({ open, onClose, driver }: DriverFormProps) {
  const isEdit = !!driver
  const createMutation = useCreateDriver()
  const updateMutation = useUpdateDriver(driver?.id ?? 0)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licenseCategory: 'HMV',
      safetyScore: 100,
    }
  })

  useEffect(() => {
    if (open) {
      if (driver) {
        reset({
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          licenseCategory: driver.licenseCategory as any,
          licenseExpiry: new Date(driver.licenseExpiry).toISOString().split('T')[0],
          contactNumber: driver.contactNumber,
          safetyScore: driver.safetyScore,
        })
      } else {
        reset({ licenseCategory: 'HMV', safetyScore: 100 })
      }
    }
  }, [open, driver, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const formattedData = {
        ...data,
        licenseExpiry: new Date(data.licenseExpiry).toISOString()
      }
      if (isEdit) {
        await updateMutation.mutateAsync(formattedData)
      } else {
        await createMutation.mutateAsync(formattedData)
      }
      onClose()
      alert(isEdit ? 'Driver updated' : 'Driver created')
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  const expiryVal = watch('licenseExpiry')
  let isExpiringSoon = false
  if (expiryVal) {
    const diff = new Date(expiryVal).getTime() - Date.now()
    if (diff > 0 && diff < 30 * 86400000) isExpiringSoon = true
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md z-50 p-6 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-slate-900">
              {isEdit ? 'Edit Driver' : 'Add Driver'}
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">Full Name</label>
              <input {...register('name')} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">License Number</label>
                <input {...register('licenseNumber')} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Category</label>
                <select {...register('licenseCategory')} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  {['LMV', 'HMV', 'MCW', 'TRANS', 'HTV'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">License Expiry Date</label>
              <input type="date" {...register('licenseExpiry')} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              {errors.licenseExpiry && <p className="text-red-500 text-xs mt-1">{errors.licenseExpiry.message}</p>}
              {isExpiringSoon && !errors.licenseExpiry && <p className="text-amber-600 text-xs mt-1 font-medium">⚠ Warning: Selected date is within 30 days.</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Contact Number</label>
                <input {...register('contactNumber')} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1">Safety Score</label>
                <input type="number" {...register('safetyScore', { valueAsNumber: true })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Driver'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
