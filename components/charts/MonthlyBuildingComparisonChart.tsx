'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useToast } from '@/components/ui/Toast'

interface MonthlyBuildingRow {
  location: string
  monthly: number[]
}

interface MonthlyBuildingComparisonChartProps {
  year: string
  months: string[]
  rows: MonthlyBuildingRow[]
}

type RangePreset = 'last3' | 'last6' | 'ytd' | 'custom'

const COLORS = ['#ff7200', '#006c49', '#5267c4', '#c2416c', '#b7791f', '#6f42c1', '#008ca8', '#708238']

function compactRupiah(value: number) {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  if (value >= 1_000) return `Rp${(value / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`
  return `Rp${value.toLocaleString('id-ID')}`
}

export default function MonthlyBuildingComparisonChart({
  year,
  months,
  rows,
}: MonthlyBuildingComparisonChartProps) {
  const { error: toastError } = useToast()
  const currentYear = new Date().getFullYear()
  const lastAvailableMonth = Number(year) === currentYear ? new Date().getMonth() + 1 : 12
  const [preset, setPreset] = useState<RangePreset>('last3')
  const [customFrom, setCustomFrom] = useState(1)
  const [customTo, setCustomTo] = useState(lastAvailableMonth)
  const [selectedLocations, setSelectedLocations] = useState<string[] | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setCustomFrom(1)
    setCustomTo(lastAvailableMonth)
  }, [year, lastAvailableMonth])

  const selectedNames = selectedLocations ?? rows.map((row) => row.location)
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedNames.includes(row.location)),
    [rows, selectedLocations],
  )

  const monthIndexes = useMemo(() => {
    let start: number
    let end: number
    if (preset === 'last3' || preset === 'last6') {
      end = lastAvailableMonth
      start = Math.max(1, end - (preset === 'last3' ? 2 : 5))
    } else if (preset === 'ytd') {
      start = 1
      end = lastAvailableMonth
    } else {
      start = Math.min(customFrom, customTo)
      end = Math.max(customFrom, customTo)
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start - 1 + index)
  }, [preset, lastAvailableMonth, customFrom, customTo])

  const chartData = useMemo(
    () => monthIndexes.map((monthIndex) => {
      const dataPoint: Record<string, string | number> = { month: months[monthIndex] }
      selectedRows.forEach((row, rowIndex) => {
        dataPoint[`building_${rowIndex}`] = row.monthly[monthIndex] ?? 0
      })
      return dataPoint
    }),
    [monthIndexes, months, selectedRows],
  )

  const total = selectedRows.reduce(
    (sum, row) => sum + monthIndexes.reduce((rowTotal, monthIndex) => rowTotal + (row.monthly[monthIndex] ?? 0), 0),
    0,
  )
  const hasTransactions = total > 0
  const chartWidth = Math.max(420, monthIndexes.length * Math.max(100, selectedRows.length * 24))
  const rangeLabel = preset === 'custom'
    ? `${months[Math.min(customFrom, customTo) - 1]}–${months[Math.max(customFrom, customTo) - 1]}`
    : preset === 'ytd'
      ? 'Year-to-Date'
      : preset === 'last3'
        ? '3 Bulan Terakhir'
        : '6 Bulan Terakhir'

  function toggleLocation(location: string) {
    const current = selectedLocations ?? rows.map((row) => row.location)
    const next = current.includes(location)
      ? current.filter((name) => name !== location)
      : [...current, location]
    setSelectedLocations(next)
  }

  async function downloadPdf() {
    if (!selectedRows.length || !hasTransactions) return
    setExporting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const left = 16
      const right = pageWidth - 14
      const chartTop = 54
      const chartBottom = pageHeight - 36
      const chartHeight = chartBottom - chartTop
      const chartWidth = right - left
      const maxAmount = Math.max(
        ...selectedRows.flatMap((row) => monthIndexes.map((monthIndex) => row.monthly[monthIndex] ?? 0)),
      )
      const axisStep = Math.max(1, Math.ceil(maxAmount / 5))
      const axisMax = axisStep * 5
      const tickLabelWidth = 22
      const plotLeft = left + tickLabelWidth
      const plotWidth = chartWidth - tickLabelWidth
      const groupWidth = plotWidth / monthIndexes.length
      const availableBarWidth = groupWidth * 0.78
      const barWidth = Math.max(
        0.5,
        Math.min(12, availableBarWidth / selectedRows.length),
      )
      const groupBarsWidth = barWidth * selectedRows.length

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('Grafik Perbandingan Total Pembelian per Gedung', left, 17)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text(`Tahun ${year} · ${rangeLabel}`, left, 24)
      pdf.text(`Bulan: ${monthIndexes.map((monthIndex) => months[monthIndex]).join(', ')}`, left, 30)
      pdf.text(`Gedung: ${selectedRows.map((row) => row.location).join(', ')}`, left, 36, {
        maxWidth: chartWidth,
      })
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Total periode: ${compactRupiah(total)}`, left, 44)
      pdf.setFont('helvetica', 'normal')

      for (let tick = 0; tick <= 5; tick += 1) {
        const amount = axisStep * tick
        const y = chartBottom - (chartHeight * tick) / 5
        pdf.setDrawColor(226, 232, 240)
        pdf.setLineWidth(0.25)
        pdf.line(plotLeft, y, right, y)
        pdf.setFontSize(8)
        pdf.setTextColor(89, 66, 54)
        pdf.text(compactRupiah(amount), left, y + 1, { align: 'left' })
      }

      monthIndexes.forEach((monthIndex, monthPosition) => {
        const groupCenter = plotLeft + groupWidth * (monthPosition + 0.5)
        selectedRows.forEach((row, rowIndex) => {
          const value = row.monthly[monthIndex] ?? 0
          const           barHeight = (value / axisMax) * chartHeight
          const x = groupCenter - groupBarsWidth / 2 + rowIndex * barWidth
          const color = COLORS[rowIndex % COLORS.length]
          const red = Number.parseInt(color.slice(1, 3), 16)
          const green = Number.parseInt(color.slice(3, 5), 16)
          const blue = Number.parseInt(color.slice(5, 7), 16)
          pdf.setFillColor(red, green, blue)
          pdf.rect(x, chartBottom - barHeight, Math.max(0.4, barWidth - 0.4), barHeight, 'F')
        })
        pdf.setFontSize(9)
        pdf.setTextColor(31, 41, 55)
        pdf.text(months[monthIndex], groupCenter, chartBottom + 6, { align: 'center' })
      })

      const legendTop = chartBottom + 16
      const legendColumnWidth = chartWidth / Math.min(selectedRows.length, 4)
      selectedRows.forEach((row, index) => {
        const column = index % 4
        const legendRow = Math.floor(index / 4)
        const x = left + column * legendColumnWidth
        const y = legendTop + legendRow * 7
        const color = COLORS[index % COLORS.length]
        pdf.setFillColor(
          Number.parseInt(color.slice(1, 3), 16),
          Number.parseInt(color.slice(3, 5), 16),
          Number.parseInt(color.slice(5, 7), 16),
        )
        pdf.rect(x, y - 3, 4, 4, 'F')
        pdf.setFontSize(8)
        pdf.setTextColor(31, 41, 55)
        pdf.text(row.location, x + 6, y, { maxWidth: legendColumnWidth - 8 })
      })

      const filename = `perbandingan-pembelian-gedung-${year}-${monthIndexes[0] + 1}-${monthIndexes[monthIndexes.length - 1] + 1}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error('Gagal mengunduh grafik PDF:', error)
      toastError('PDF gagal dibuat. Silakan coba kembali.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="mb-space-lg rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-4 shadow-level-1 sm:p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-headline-sm font-semibold text-on-surface">Grafik Perbandingan Total Pembelian per Gedung</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Bandingkan nominal pembelian bulanan antar gedung untuk tahun {year}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-body-sm text-on-surface-variant">
            Total periode: <strong className="text-primary">{compactRupiah(total)}</strong>
          </div>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={!selectedRows.length || !hasTransactions || exporting}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary-container px-3 py-2 text-label-sm font-semibold text-on-primary transition hover:bg-[#E66700] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="ms text-[18px]" aria-hidden="true">picture_as_pdf</span>
            {exporting ? 'Menyiapkan PDF...' : 'Unduh PDF'}
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-label-md font-semibold text-on-surface">Rentang bulan</legend>
          <div className="flex flex-wrap gap-2">
            {([
              ['last3', '3 Bulan Terakhir'],
              ['last6', '6 Bulan Terakhir'],
              ['ytd', 'Year-to-Date'],
              ['custom', 'Custom Range Bulan'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={preset === value}
                onClick={() => setPreset(value)}
                className={`min-h-10 rounded-lg border px-3 text-label-sm font-medium transition-colors ${
                  preset === value
                    ? 'border-primary bg-primary-container text-on-primary'
                    : 'border-[#E2E8F0] bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="comparison-month-from">Dari bulan</label>
              <select
                id="comparison-month-from"
                value={customFrom}
                onChange={(event) => setCustomFrom(Number(event.target.value))}
                className="h-10 rounded-lg border border-[#E2E8F0] bg-surface-container-low px-3 text-body-sm text-on-surface"
              >
                {months.slice(0, lastAvailableMonth).map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
              <span className="text-body-sm text-on-surface-variant">sampai</span>
              <label className="sr-only" htmlFor="comparison-month-to">Sampai bulan</label>
              <select
                id="comparison-month-to"
                value={customTo}
                onChange={(event) => setCustomTo(Number(event.target.value))}
                className="h-10 rounded-lg border border-[#E2E8F0] bg-surface-container-low px-3 text-body-sm text-on-surface"
              >
                {months.slice(0, lastAvailableMonth).map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          )}
        </fieldset>

        <fieldset className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <legend className="text-label-md font-semibold text-on-surface">Gedung yang dibandingkan</legend>
            <button
              type="button"
              onClick={() => setSelectedLocations(null)}
              className="text-label-sm font-medium text-primary hover:underline"
            >
              Pilih semua
            </button>
          </div>
          {rows.length ? (
            <div className="grid max-h-32 grid-cols-1 gap-x-4 gap-y-2 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-surface-container-low/50 p-3 sm:grid-cols-2">
              {rows.map((row) => (
                <label key={row.location} className="flex min-w-0 items-center gap-2 text-body-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={selectedNames.includes(row.location)}
                    onChange={() => toggleLocation(row.location)}
                    className="h-4 w-4 flex-shrink-0 accent-[#ff7200]"
                  />
                  <span className="truncate" title={row.location}>{row.location}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-[#E2E8F0] bg-surface-container-low/50 p-3 text-body-sm text-on-surface-variant">
              Tidak ada data gedung.
            </p>
          )}
        </fieldset>
      </div>

      {selectedRows.length && total > 0 ? (
        <div className="overflow-x-auto">
          <div style={{ minWidth: chartWidth, width: '100%', height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#594236' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={80}
                  tick={{ fontSize: 11, fill: '#594236' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => compactRupiah(Number(value))}
                />
                <Tooltip
                  formatter={(value) => [compactRupiah(Number(value)), 'Total pembelian']}
                  labelStyle={{ fontWeight: 700, color: '#1f2937' }}
                  contentStyle={{ borderRadius: 12, borderColor: '#E2E8F0' }}
                />
                <Legend />
                {selectedRows.map((row, index) => (
                  <Bar
                    key={row.location}
                    dataKey={`building_${index}`}
                    name={row.location}
                    fill={COLORS[index % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={42}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex min-h-48 items-center justify-center rounded-xl bg-surface-container-low/50 px-4 text-center text-body-sm text-on-surface-variant">
          {!selectedRows.length
            ? 'Pilih setidaknya satu gedung untuk membandingkan pembelian.'
            : 'Belum ada transaksi pembelian pada rentang bulan yang dipilih.'}
        </div>
      )}
    </section>
  )
}
