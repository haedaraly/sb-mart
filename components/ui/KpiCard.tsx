import { cn } from '@/lib/utils'
import React from 'react'

interface KpiCardProps {
  label: string
  value: React.ReactNode
  sub: React.ReactNode
  icon: string
  iconBg?: string
  iconColor?: string
  className?: string
}

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  iconBg = 'bg-primary-fixed/40',
  iconColor = 'text-primary',
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'p-space-lg rounded-xl bg-surface-container-lowest shadow-level-1 flex items-center justify-between border border-[#FFE0CC] hover:shadow-level-2 transition-shadow',
        className,
      )}
    >
      <div className="flex flex-col min-w-0">
        <span className="text-label-md font-label-md text-on-surface-variant">
          {label}
        </span>
        <span className="text-metric-display font-metric-display text-on-surface mt-1 tabular-nums truncate">
          {value}
        </span>
        <div className="flex items-center gap-1.5 mt-2 text-body-sm font-body-sm text-on-surface-variant">
          {sub}
        </div>
      </div>
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          iconBg,
          iconColor,
        )}
      >
        <span className="ms text-[26px]">{icon}</span>
      </div>
    </div>
  )
}
