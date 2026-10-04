'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** aria-labelledby custom id */
  labelId?: string
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

/** Trap focus within the modal while it is open */
function useFocusTrap(ref: React.RefObject<HTMLElement>, open: boolean) {
  useEffect(() => {
    if (!open || !ref.current) return
    const el = ref.current

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    // Auto-focus first focusable element
    first?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last?.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
      }
    }

    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [open, ref])
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  labelId,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const titleId = labelId ?? `modal-title-${title.replace(/\s/g, '-')}`

  useEffect(() => {
    setMounted(true)
  }, [])

  useFocusTrap(panelRef, open)

  // Escape key closes modal
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open || !mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? `${titleId}-desc` : undefined}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative w-full bg-surface-container-lowest rounded-2xl shadow-level-3 border border-[#E2E8F0]',
          'animate-slide-in-from-bottom',
          sizeClass[size],
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-[#E2E8F0]">
          <div className="flex-1 min-w-0">
            <h2
              id={titleId}
              className="text-headline-sm font-headline-sm text-on-surface font-semibold"
            >
              {title}
            </h2>
            {description && (
              <p
                id={`${titleId}-desc`}
                className="mt-0.5 text-body-sm font-body-sm text-on-surface-variant"
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
          >
            <span className="ms text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
