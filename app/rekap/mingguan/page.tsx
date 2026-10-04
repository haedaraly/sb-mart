'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { formatRupiah } from '@/lib/data/transactions'

interface WeeklyRow {
  id: number
  no: string
  date: string
  location: string
  operator: string
  itemCount: number
  total: number
}

interface WeeklyReport {
  rows: WeeklyRow[]
  locations: { code: string; name: string }[]
  categories: string[]
  total: number
}

function dateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function defaultWeekStart() {
  const today = new Date()
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return dateInput(monday)
}

const today = dateInput(new Date())

export default function RekapMingguanPage() {
  const [from, setFrom] = useState(defaultWeekStart)
  const [to, setTo] = useState(today)
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadReport() {
      if (!from || !to || from > to) {
        setError('Rentang tanggal tidak valid.')
        setReport(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ from, to })
        if (location) params.set('g', location)
        if (category) params.set('c', category)
        const response = await fetch(`/api/reports/weekly?${params}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Gagal memuat rekap mingguan.')
        setReport(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Gagal memuat rekap mingguan.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadReport()
    return () => controller.abort()
  }, [from, to, location, category])

  const total = report?.total ?? 0
  const count = report?.rows.length ?? 0
  const exportParams = new URLSearchParams({ a: from, b: to })
  if (location) exportParams.set('g', location)
  if (category) exportParams.set('c', category)

  return (
    <AppShell>
      <div className="flex w-full flex-col">
        <div className="mb-space-xl flex flex-col gap-space-lg xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 flex-col">
            <div className="mb-1 flex items-center gap-space-sm">
              <span className="rounded-full bg-secondary-fixed/50 px-2 py-0.5 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-secondary">
                Laporan Kas Operasional
              </span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">• Rekap Mingguan</span>
            </div>
            <h1 className="flex items-center gap-3 text-display-lg font-display-lg tracking-tight text-on-surface">
              <span className="ms text-secondary text-[32px]">analytics</span>
              Rekap Pembelian Mingguan
            </h1>
            <p className="mt-1 text-body-md font-body-md text-on-surface-variant">
              Ringkasan transaksi pada rentang tanggal dan filter yang dipilih.
            </p>
          </div>
          <a
            href={`/api/export/weekly?${exportParams.toString()}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-surface-container-lowest px-4 py-2.5 font-semibold text-on-surface shadow-level-1 transition-all hover:bg-surface-container-low"
          >
            <span className="ms text-[18px] text-secondary">download</span>
            Export Excel
          </a>
        </div>

        <section className="mb-space-lg grid grid-cols-1 gap-3 rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-4 shadow-level-1 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="weekly-from" className="mb-1 block text-label-md font-semibold text-on-surface">Dari tanggal</label>
            <input
              id="weekly-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
              className="h-11 w-full rounded-xl bg-surface-container-low px-3 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div>
            <label htmlFor="weekly-to" className="mb-1 block text-label-md font-semibold text-on-surface">Sampai tanggal</label>
            <input
              id="weekly-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              className="h-11 w-full rounded-xl bg-surface-container-low px-3 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div>
            <label htmlFor="weekly-location" className="mb-1 block text-label-md font-semibold text-on-surface">Gedung / Lokasi</label>
            <select
              id="weekly-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="h-11 w-full rounded-xl bg-surface-container-low px-3 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">Semua Gedung</option>
              {report?.locations.map((option) => (
                <option key={option.code} value={option.code}>{option.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="weekly-category" className="mb-1 block text-label-md font-semibold text-on-surface">Kategori</label>
            <select
              id="weekly-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 w-full rounded-xl bg-surface-container-low px-3 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">Semua Kategori</option>
              {report?.categories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </section>

        {error && <p role="alert" className="mb-space-md text-body-sm text-error">{error}</p>}

        <div className="mb-space-lg grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-5 shadow-level-1">
            <span className="text-label-md font-medium text-on-surface-variant">Total Belanja Periode Ini</span>
            <div className="mt-1 font-mono text-headline-lg font-bold text-primary">{formatRupiah(total)}</div>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-5 shadow-level-1">
            <span className="text-label-md font-medium text-on-surface-variant">Jumlah Transaksi</span>
            <div className="mt-1 text-headline-lg font-bold text-secondary">{count} Nota</div>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-5 shadow-level-1">
            <span className="text-label-md font-medium text-on-surface-variant">Rata-rata per Nota</span>
            <div className="mt-1 font-mono text-headline-lg font-bold text-on-surface">
              {formatRupiah(count ? Math.round(total / count) : 0)}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest shadow-level-1">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
            <h2 className="text-headline-sm font-semibold text-on-surface">Daftar Transaksi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-surface-container-low/50 text-label-md font-label-md text-on-surface-variant">
                  <th className="w-12 px-4 py-3.5 text-center">No</th>
                  <th className="px-4 py-3.5">No. Transaksi</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Gedung / Lokasi</th>
                  <th className="px-4 py-3.5">Operator</th>
                  <th className="px-4 py-3.5 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-body-md text-on-surface">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">Memuat rekap...</td></tr>
                ) : report?.rows.length ? report.rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 text-center text-on-surface-variant">{index + 1}</td>
                    <td className="px-4 py-3 font-mono font-medium text-primary">{row.no}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3">{row.location}</td>
                    <td className="px-4 py-3">{row.operator}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">{formatRupiah(row.total)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">Tidak ada transaksi pada filter ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
