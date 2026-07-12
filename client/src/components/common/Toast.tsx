import React, { createContext, useContext, useState, ReactNode } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastMessage {
  id: string
  type: ToastType
  title?: string
  message: string
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    warning: (title: string, msg: string) => void
    info: (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (type: ToastType, message: string, title?: string) => {
    setToasts(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, message, title }])
  }

  const toastMethods = {
    success: (msg: string) => addToast('success', msg),
    error:   (msg: string) => addToast('error', msg),
    warning: (title: string, msg: string) => addToast('warning', msg, title),
    info:    (msg: string) => addToast('info', msg),
  }

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onOpenChange={(open) => {
            if (!open) setToasts(prev => prev.filter(x => x.id !== t.id))
          }} />
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-3 w-full max-w-[380px] z-[100]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onOpenChange }: { toast: ToastMessage, onOpenChange: (o: boolean) => void }) {
  const styles = {
    success: { border: 'border-l-emerald-500', icon: <CheckCircle className="text-emerald-500 w-5 h-5" /> },
    error:   { border: 'border-l-red-500', icon: <X className="text-red-500 w-5 h-5 bg-red-100 rounded-full p-0.5" /> },
    warning: { border: 'border-l-amber-500', icon: <AlertTriangle className="text-amber-500 w-5 h-5" /> },
    info:    { border: 'border-l-blue-500', icon: <Info className="text-blue-500 w-5 h-5" /> },
  }
  const s = styles[toast.type]

  return (
    <ToastPrimitive.Root 
      duration={toast.type === 'warning' ? 6000 : 4000}
      onOpenChange={onOpenChange}
      className={`bg-white rounded-lg shadow-xl border border-slate-200 border-l-4 ${s.border} p-4 flex gap-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-out data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full data-[state=closed]:fade-out-80`}
    >
      <div className="shrink-0 mt-0.5">{s.icon}</div>
      <div className="flex-1">
        {toast.title && <ToastPrimitive.Title className="text-sm font-semibold text-slate-900 mb-1">{toast.title}</ToastPrimitive.Title>}
        <ToastPrimitive.Description className="text-[13px] text-slate-600 font-medium leading-snug">
          {toast.message}
        </ToastPrimitive.Description>
      </div>
      <ToastPrimitive.Close className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0 self-start">
        <X className="w-4 h-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}
