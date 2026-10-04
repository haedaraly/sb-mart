'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import MonthlyBuildingComparisonChart from '@/components/charts/MonthlyBuildingComparisonChart'
import { formatRupiah } from '@/lib/data/transactions'

interface MonthlyReport {
  months: string[]
  rows: { location: string; monthly: number[]; total: number }[]
  totals: number[]
  grandTotal: number
}

export default function RekapBulananPage() {
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadReport() {
      setLoading(true)
      setError('')
      setReport(null)
      try {
        const response = await fetch(`/api/reports/monthly?y=${year}`, {
          signal: controller.signal,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Gagal memuat rekap bulanan.')
        setReport(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Gagal memuat rekap bulanan.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadReport()
    return () => controller.abort()
  }, [year])

  return (
    <AppShell>
      <div className="flex flex-col w-full">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold px-2 py-0.5 rounded-full bg-primary-fixed/50">
                Laporan Tutup Buku
              </span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                • Rekap Bulanan
              </span>
            </div>
            <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight flex items-center gap-3">
              <span className="ms text-primary text-[32px]">calendar_month</span>
              Perbandingan Pembelian Bulanan
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">
              Perbandingan total pembelian setiap gedung dari Januari sampai Desember.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-label-md font-medium text-on-surface-variant">
              Tahun
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="h-10 w-28 px-3 rounded-xl bg-surface-container-lowest text-on-surface border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </label>
            <a
              href={`/api/export/monthly?y=${year}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-semibold shadow-level-1 hover:bg-surface-container-low transition-all border border-[#E2E8F0]"
            >
              <span className="ms text-[18px] text-primary">download</span>
              Export Excel Bulanan
            </a>
          </div>
        </div>

        {report && !error && (
          <MonthlyBuildingComparisonChart
            year={year}
            months={report.months}
            rows={report.rows}
          />
        )}

        <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-[#E2E8F0] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-headline-sm font-semibold text-on-surface">
              Total Pembelian per Gedung — {year}
            </h2>
            {report && (
              <span className="text-body-sm text-on-surface-variant">
                Total seluruh gedung: <strong className="text-primary">{formatRupiah(report.grandTotal)}</strong>
              </span>
            )}
          </div>
          {error ? (
            <p role="alert" className="p-6 text-error">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-surface-container-low/50 text-label-md font-label-md text-on-surface-variant">
                    <th className="py-3.5 px-4 sticky left-0 bg-surface-container-lowest">Gedung</th>
                    {(report?.months ?? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']).map((month) => (
                      <th key={month} className="py-3.5 px-4 text-right">{month}</th>
                    ))}
                    <th className="py-3.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-body-sm text-on-surface">
                  {loading ? (
                    <tr><td colSpan={14} className="py-8 px-4 text-center text-on-surface-variant">Memuat rekap...</td></tr>
                  ) : report?.rows.length ? (
                    <>
                      {report.rows.map((row) => (
                        <tr key={row.location} className="hover:bg-surface-container-low/50">
                          <th scope="row" className="py-3 px-4 font-semibold whitespace-nowrap sticky left-0 bg-surface-container-lowest">{row.location}</th>
                          {row.monthly.map((amount, index) => (
                            <td key={index} className="py-3 px-4 text-right font-mono whitespace-nowrap">{formatRupiah(amount)}</td>
                          ))}
                          <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">{formatRupiah(row.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-surface-container-low font-bold">
                        <th scope="row" className="py-3 px-4 sticky left-0 bg-surface-container-low">TOTAL</th>
                        {report.totals.map((amount, index) => (
                          <td key={index} className="py-3 px-4 text-right font-mono whitespace-nowrap">{formatRupiah(amount)}</td>
                        ))}
                        <td className="py-3 px-4 text-right font-mono text-primary whitespace-nowrap">{formatRupiah(report.grandTotal)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr><td colSpan={14} className="py-8 px-4 text-center text-on-surface-variant">Belum ada data pembelian untuk tahun {year}.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
