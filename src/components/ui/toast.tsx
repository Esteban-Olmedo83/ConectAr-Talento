'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ----- Types -----

export type ToastType = 'default' | 'success' | 'error' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  toast: (item: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

// ----- Context -----

const ToastContext = React.createContext<ToastContextValue | null>(null)

// ----- Provider -----

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const toast = React.useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const duration = item.duration ?? 4000
    setToasts((prev) => [...prev, { ...item, id }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ----- Hook -----

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// ----- Icons -----

const toastIcons: Record<ToastType, React.ReactNode> = {
  default: <Info className="h-5 w-5 text-blue-500" />,
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
}

const toastStyles: Record<ToastType, string> = {
  default: 'border-border bg-background',
  success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950',
  error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
  warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
}

// ----- Single Toast -----

interface ToastCardProps {
  toast: ToastItem
  dismiss: (id: string) => void
}

function ToastCard({ toast: t, dismiss }: ToastCardProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all animate-in slide-in-from-right-full fade-in-0',
        toastStyles[t.type]
      )}
    >
      <span className="mt-0.5 shrink-0">{toastIcons[t.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{t.title}</p>
        {t.description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(t.id)}
        className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ----- Viewport (portal) -----

interface ToastViewportProps {
  toasts: ToastItem[]
  dismiss: (id: string) => void
}

function ToastViewport({ toasts, dismiss }: ToastViewportProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted || toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-label="Notificaciones"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>,
    document.body
  )
}

export { ToastCard, ToastViewport }
