'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

const variantStyles = {
  danger: {
    icon: 'delete_forever',
    iconBg: 'bg-error-container',
    iconColor: 'text-error',
    confirmBtn:
      'bg-error text-on-error hover:bg-error/90 focus-visible:ring-error',
  },
  warning: {
    icon: 'warning',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
    confirmBtn:
      'bg-tertiary-fixed text-on-tertiary hover:bg-tertiary-fixed/80 focus-visible:ring-tertiary',
  },
  info: {
    icon: 'info',
    iconBg: 'bg-primary-fixed/40',
    iconColor: 'text-primary',
    confirmBtn:
      'bg-primary-container text-on-primary hover:bg-[#E66700] focus-visible:ring-primary-container',
  },
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  const s = variantStyles[variant]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus the cancel button by default (safer UX)
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 50)
    }
  }, [open])

  // Escape closes
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open || !mounted) return null

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-msg"
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-level-3 border border-[#E2E8F0] animate-zoom-in-95 p-6">
        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-4', s.iconBg)}>
          <span className={cn('ms text-[24px]', s.iconColor)}>{s.icon}</span>
        </div>

        {/* Text */}
        <h2
          id="confirm-title"
          className="text-headline-sm font-headline-sm text-on-surface font-semibold mb-1"
        >
          {title}
        </h2>
        <p id="confirm-msg" className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-body-md font-body-md text-on-surface hover:bg-surface-container-low transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-xl text-body-md font-body-md font-semibold transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2',
              s.confirmBtn,
            )}
          >
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
