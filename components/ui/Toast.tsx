'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantConfig: Record<ToastVariant, { icon: string; bgClass: string; iconClass: string; borderClass: string }> = {
  success: {
    icon: 'check_circle',
    bgClass: 'bg-[#ECFDF5]',
    iconClass: 'text-[#065F46]',
    borderClass: 'border-[#A7F3D0]',
  },
  error: {
    icon: 'error',
    bgClass: 'bg-[#FEF2F2]',
    iconClass: 'text-error',
    borderClass: 'border-[#FECACA]',
  },
  warning: {
    icon: 'warning',
    bgClass: 'bg-[#FFFBEB]',
    iconClass: 'text-[#92400E]',
    borderClass: 'border-[#FDE68A]',
  },
  info: {
    icon: 'info',
    bgClass: 'bg-primary-fixed/30',
    iconClass: 'text-primary',
    borderClass: 'border-primary-fixed',
  },
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const cfg = variantConfig[item.variant]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(item.id), 300)
    }, item.duration ?? 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [item.id, item.duration, onRemove])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-level-2 max-w-xs w-full text-body-md font-body-md text-on-surface transition-all duration-300',
        cfg.bgClass, cfg.borderClass,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}
    >
      <span className={cn('ms text-[20px] flex-shrink-0 mt-0.5', cfg.iconClass)}>{cfg.icon}</span>
      <span className="flex-1 leading-snug">{item.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(item.id), 300) }}
        aria-label="Tutup notifikasi"
        className="flex-shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="ms text-[18px]">close</span>
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'info', duration?: number) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, variant, duration }])
  }, [])

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast])
  const error = useCallback((msg: string) => toast(msg, 'error', 6000), [toast])
  const warning = useCallback((msg: string) => toast(msg, 'warning'), [toast])
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {mounted && toasts.length > 0 && createPortal(
        <div
          aria-label="Notifikasi"
          className="fixed bottom-6 right-6 z-[400] flex flex-col gap-2 items-end"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} item={t} onRemove={remove} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
