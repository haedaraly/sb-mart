'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import MasterFormModal, { type MasterKey } from '@/components/master/MasterFormModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface MasterColumn<T> {
  key: string
  label: string
  className?: string
  render: (item: T) => React.ReactNode
}

interface MasterDataViewProps<T> {
  title: string
  description: string
  badgeText: string
  icon: string
  masterKey: MasterKey
  addLabel: string
  columns: MasterColumn<T>[]
  searchPlaceholder?: string
  searchFields?: (item: T) => string
}

export default function MasterDataView<T extends { id: number; name: string; isActive?: boolean }>({
  title,
  description,
  badgeText,
  icon,
  masterKey,
  addLabel,
  columns,
  searchPlaceholder = 'Cari berdasarkan nama atau kode...',
  searchFields,
}: MasterDataViewProps<T>) {
  const { success, error: toastError } = useToast()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal form states
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)

  // Extra relations for products (categories & units)
  const [categories, setCategories] = useState<string[]>([])
  const [units, setUnits] = useState<string[]>([])

  // Confirm dialog states
  const [confirmToggle, setConfirmToggle] = useState<{
    item: T
    nextActive: boolean
  } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch list
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/master/${masterKey}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      const json = await res.json()
      setData(json)

      // If product, also fetch categories and units for modal selects
      if (masterKey === 'products') {
        const [catRes, unitRes] = await Promise.all([
          fetch('/api/master/categories'),
          fetch('/api/master/units'),
        ])
        if (catRes.ok) {
          const cats = await catRes.json()
          setCategories(cats.map((c: any) => c.name))
        }
        if (unitRes.ok) {
          const uns = await unitRes.json()
          setUnits(uns.map((u: any) => u.name))
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }, [masterKey, toastError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Toggle active status via ConfirmDialog
  const handleToggleConfirm = async () => {
    if (!confirmToggle) return
    try {
      setActionLoading(true)
      const { item, nextActive } = confirmToggle
      const res = await fetch(`/api/master/${masterKey}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          on: nextActive,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal mengubah status')
      }
      success(`Status "${item.name}" berhasil diubah menjadi ${nextActive ? 'Aktif' : 'Nonaktif'}.`)
      setConfirmToggle(null)
      fetchData()
    } catch (err: any) {
      toastError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Delete item via ConfirmDialog
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    try {
      setActionLoading(true)
      const res = await fetch(`/api/master/${masterKey}/${confirmDelete.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus data')
      }
      success(`Data "${confirmDelete.name}" berhasil dihapus.`)
      setConfirmDelete(null)
      fetchData()
    } catch (err: any) {
      toastError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (statusFilter === 'active' && !item.isActive) return false
      if (statusFilter === 'inactive' && item.isActive) return false

      // Search filter
      if (!search.trim()) return true
      const q = search.toLowerCase()
      if (searchFields) {
        return searchFields(item).toLowerCase().includes(q)
      }
      return item.name.toLowerCase().includes(q)
    })
  }, [data, search, statusFilter, searchFields])

  return (
    <AppShell>
      <div className="flex flex-col w-full">
        {/* ── Page Header ─────────────────────────────── */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold px-2 py-0.5 rounded-full bg-primary-fixed/50">
                {badgeText}
              </span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                • Master Data LPI
              </span>
            </div>
            <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight flex items-center gap-3">
              <span className="ms text-primary text-[32px]">{icon}</span>
              {title}
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1 max-w-3xl">
              {description}
            </p>
          </div>

          {/* Action button */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => {
                setEditingItem(null)
                setFormOpen(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-headline-sm font-headline-sm shadow-level-2 hover:bg-[#E66700] hover:shadow-level-3 transition-all active:scale-[0.99]"
              type="button"
            >
              <span className="ms text-[20px]">add_circle</span>
              <span>{addLabel}</span>
            </button>
          </div>
        </div>

        {/* ── Filter & Search Toolbar ──────────────────── */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 border border-[#E2E8F0] mb-space-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <span className="ms absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-body-sm text-on-surface-variant font-medium">Status:</span>
            <div className="inline-flex rounded-xl bg-surface-container-low p-1 border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-3 py-1 rounded-lg text-body-sm font-medium transition-all',
                  statusFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                Semua ({data.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={cn(
                  'px-3 py-1 rounded-lg text-body-sm font-medium transition-all',
                  statusFilter === 'active'
                    ? 'bg-surface-container-lowest text-secondary shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                Aktif ({data.filter((d) => d.isActive).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={cn(
                  'px-3 py-1 rounded-lg text-body-sm font-medium transition-all',
                  statusFilter === 'inactive'
                    ? 'bg-surface-container-lowest text-on-surface-variant shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                Nonaktif ({data.filter((d) => !d.isActive).length})
              </button>
            </div>
          </div>
        </div>

        {/* ── Table Card ──────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-surface-container-low/50 text-label-md font-label-md text-on-surface-variant">
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  {columns.map((col) => (
                    <th key={col.key} className={cn('py-3.5 px-4 font-semibold', col.className)}>
                      {col.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center w-28">Status</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-body-md font-body-md text-on-surface">
                {loading ? (
                  // Skeleton state
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4 text-center">
                        <Skeleton className="w-5 h-4 mx-auto" />
                      </td>
                      {columns.map((col) => (
                        <td key={col.key} className="py-4 px-4">
                          <Skeleton className="w-3/4 h-4" />
                        </td>
                      ))}
                      <td className="py-4 px-4 text-center">
                        <Skeleton className="w-16 h-6 mx-auto rounded-full" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Skeleton className="w-14 h-8 mx-auto rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  // Empty state
                  <tr>
                    <td colSpan={columns.length + 3} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="ms text-[40px] text-on-surface-variant/40">
                          inventory_2
                        </span>
                        <p className="text-body-lg font-body-lg font-medium text-on-surface">
                          Tidak ada data yang ditemukan
                        </p>
                        <p className="text-body-sm font-body-sm text-on-surface-variant">
                          {search
                            ? `Tidak ada hasil untuk kata kunci "${search}".`
                            : 'Belum ada data untuk kategori master ini.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Data rows
                  filteredData.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={cn(
                        'hover:bg-surface-container-low/60 transition-colors',
                        !item.isActive && 'bg-surface-container-low/20 opacity-75'
                      )}
                    >
                      <td className="py-3.5 px-4 text-center text-body-sm text-on-surface-variant">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      {columns.map((col) => (
                        <td key={col.key} className={cn('py-3.5 px-4', col.className)}>
                          {col.render(item)}
                        </td>
                      ))}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmToggle({
                              item,
                              nextActive: !item.isActive,
                            })
                          }
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer',
                            item.isActive
                              ? 'bg-secondary-fixed/50 text-secondary border border-secondary/20'
                              : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                          )}
                          title={`Klik untuk ${item.isActive ? 'menonaktifkan' : 'mengaktifkan'}`}
                        >
                          <span className="ms text-[14px]">
                            {item.isActive ? 'check_circle' : 'cancel'}
                          </span>
                          {item.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item)
                              setFormOpen(true)
                            }}
                            title="Ubah data"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                          >
                            <span className="ms text-[18px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(item)}
                            title="Hapus data"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                          >
                            <span className="ms text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Form Modal ──────────────────────────────── */}
      <MasterFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false)
          fetchData()
        }}
        masterKey={masterKey}
        initialData={editingItem}
        categories={categories}
        units={units}
      />

      {/* ── Confirm Status Toggle Dialog ────────────── */}
      <ConfirmDialog
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggleConfirm}
        loading={actionLoading}
        title={
          confirmToggle?.nextActive
            ? 'Aktifkan Data Master?'
            : 'Nonaktifkan Data Master?'
        }
        message={`Apakah Anda yakin ingin ${
          confirmToggle?.nextActive ? 'mengaktifkan' : 'menonaktifkan'
        } "${confirmToggle?.item.name}"? Data yang nonaktif tidak akan muncul pada pilihan transaksi baru.`}
        confirmLabel={confirmToggle?.nextActive ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan'}
        variant={confirmToggle?.nextActive ? 'info' : 'warning'}
      />

      {/* ── Confirm Delete Dialog ───────────────────── */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        title="Hapus Data Master?"
        message={`Apakah Anda yakin ingin menghapus data "${confirmDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        variant="danger"
      />
    </AppShell>
  )
}
