'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const data = [
  { gedung: 'Shofiyah-TU', total: 34, value: 18600000 },
  { gedung: 'Umar-Matham', total: 28, value: 24300000 },
  { gedung: 'Utsman-Asrama', total: 21, value: 15800000 },
  { gedung: 'Copy Center', total: 14, value: 8900000 },
  { gedung: 'Klinik Santri', total: 12, value: 7200000 },
  { gedung: "Masjid Jami'", total: 9, value: 5400000 },
  { gedung: 'Lainnya', total: 8, value: 4030000 },
]

const COLORS = [
  '#ff7200', '#e88219', '#ffb77d', '#ffdbca',
  '#006c49', '#4edea3', '#6cf8bb',
]

function formatRupiah(value: number) {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}Jt`
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}Rb`
  return `Rp${value}`
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: { gedung: string; total: number; value: number } }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-inverse-surface text-inverse-on-surface rounded-xl px-3 py-2 shadow-level-3 text-body-sm font-body-sm">
      <div className="font-semibold mb-1">{d.gedung}</div>
      <div className="flex justify-between gap-4">
        <span className="text-[#ffb77d]">{d.total} transaksi</span>
        <span className="tabular-nums">{formatRupiah(d.value)}</span>
      </div>
    </div>
  )
}

export default function SpendingByLocationChart() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-[#E2E8F0] p-space-lg">
      <div className="flex items-center justify-between mb-space-md">
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">
            Belanja per Gedung / Lokasi
          </h3>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
            Oktober 2026 — jumlah transaksi &amp; nominal total
          </p>
        </div>
        <span className="ms text-[20px] text-primary">bar_chart</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: -8, bottom: 4 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            vertical={false}
          />
          <XAxis
            dataKey="gedung"
            tick={{ fontSize: 10, fill: '#594236', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#594236' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF2E8' }} />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
