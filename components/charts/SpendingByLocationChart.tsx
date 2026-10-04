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

interface LocationSpending {
  gedung: string
  total: number
  transaksi: number
}

interface SpendingByLocationChartProps {
  data: LocationSpending[]
  period: string
}

const COLORS = ['#ff7200', '#e88219', '#ffb77d', '#006c49', '#4edea3', '#6cf8bb']

function formatRupiah(value: number) {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)} jt`
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)} rb`
  return `Rp${value}`
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: LocationSpending }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const location = payload[0].payload
  return (
    <div className="rounded-xl bg-inverse-surface px-3 py-2 text-body-sm font-body-sm text-inverse-on-surface shadow-level-3">
      <div className="mb-1 font-semibold">{location.gedung}</div>
      <div className="flex justify-between gap-4">
        <span>{location.transaksi} transaksi</span>
        <span className="tabular-nums">{formatRupiah(location.total)}</span>
      </div>
    </div>
  )
}

export default function SpendingByLocationChart({ data, period }: SpendingByLocationChartProps) {
  const chartHeight = Math.max(260, data.length * 38)

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-space-lg shadow-level-1">
      <div className="mb-space-md flex items-center justify-between">
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Belanja per Gedung / Lokasi</h3>
          <p className="mt-0.5 text-body-sm font-body-sm text-on-surface-variant">
            {period} — total nominal pembelian
          </p>
        </div>
        <span className="ms text-[20px] text-primary">bar_chart</span>
      </div>
      {data.length && data.some((location) => location.total > 0) ? (
        <div className="overflow-x-auto">
          <div style={{ minWidth: 320, height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#594236' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatRupiah(Number(value))}
                />
                <YAxis
                  type="category"
                  dataKey="gedung"
                  width={130}
                  interval={0}
                  tick={{ fontSize: 10, fill: '#594236', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF2E8' }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {data.map((location, index) => (
                    <Cell key={location.gedung} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="py-8 text-center text-body-sm text-on-surface-variant">
          Belum ada data pengeluaran untuk periode ini.
        </p>
      )}
    </div>
  )
}
