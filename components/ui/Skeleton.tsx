'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/** Single animated skeleton block */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-container-high animate-skeleton rounded-lg',
        className,
      )}
    />
  )
}

export default Skeleton

/** Skeleton for a single KPI card */
export function KpiCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-level-1 border border-[#E2E8F0] flex flex-col gap-3" aria-busy="true" aria-label="Memuat data...">
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

/** Skeleton for a table row */
export function TableRowSkeleton({ cols = 9 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <Skeleton className={cn('h-4', i === 0 ? 'w-6 mx-auto' : i === cols - 1 ? 'w-20 mx-auto' : 'w-full max-w-[120px]')} />
        </td>
      ))}
    </tr>
  )
}

/** Skeleton for a full table section */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-[#E2E8F0] overflow-hidden" aria-busy="true" aria-label="Memuat tabel...">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FFF9F5] border-b border-[#E2E8F0]">
              {Array.from({ length: 9 }).map((_, i) => (
                <th key={i} className="py-3.5 px-4">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]/50">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Generic list/card skeleton */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Memuat daftar...">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl border border-[#E2E8F0]">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/** Inline spinner */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Memuat..."
      className={cn(
        'inline-block w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin',
        className,
      )}
    />
  )
}
