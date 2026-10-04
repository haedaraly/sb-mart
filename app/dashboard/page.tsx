import AppShell from '@/components/layout/AppShell'
import KpiCard from '@/components/ui/KpiCard'
import SpendingByLocationChart from '@/components/charts/SpendingByLocationChart'
import { prisma } from '@/lib/db'
import { formatRupiah } from '@/lib/data/transactions'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const [locations, monthPurchases, todayCount] = await Promise.all([
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.purchase.findMany({
      where: { date: { gte: monthStart, lt: nextMonthStart } },
      include: { location: true, creator: true, items: true },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    }),
    prisma.purchase.count({ where: { date: { gte: todayStart, lt: tomorrowStart } } }),
  ])

  const locationTotals = new Map(
    locations.map((location) => [
      location.id,
      { gedung: location.name, total: 0, transaksi: 0 },
    ])
  )
  const categoryTotals = new Map<string, number>()
  let totalMonth = 0

  for (const purchase of monthPurchases) {
    const location = locationTotals.get(purchase.locationId)
    if (location) location.transaksi += 1
    for (const item of purchase.items) {
      const amount = Number(item.totalPrice)
      totalMonth += amount
      if (location) location.total += amount
      categoryTotals.set(item.categoryName, (categoryTotals.get(item.categoryName) ?? 0) + amount)
    }
  }

  const chartData = Array.from(locationTotals.values())
  const activeLocation = [...chartData].sort((a, b) => b.transaksi - a.transaksi)[0]
  const topCategories = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxCategoryTotal = topCategories[0]?.[1] ?? 0
  const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now)

  return (
    <AppShell>
      <div className="flex flex-col gap-space-xl">
        <div className="flex flex-col gap-space-lg xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary-fixed/50 px-2 py-1 text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold">
                Ringkasan Pembelian
              </span>
            </div>
            <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight">Dashboard</h1>
            <p className="mt-2 max-w-3xl text-body-md font-body-md text-on-surface-variant">
              Ringkasan aktual pembelian dan pengeluaran unit serta gedung.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-surface-container-lowest px-4 py-2.5 shadow-level-1">
            <span className="ms text-[18px] text-primary">today</span>
            <span className="text-label-md font-label-md text-on-surface">{currentMonth}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Belanja Bulan Ini"
            value={formatRupiah(totalMonth)}
            sub={currentMonth}
            icon="receipt_long"
            iconBg="bg-primary-fixed/40"
            iconColor="text-primary"
          />
          <KpiCard
            label="Transaksi Bulan Ini"
            value={`${monthPurchases.length} nota`}
            sub="Jumlah transaksi tercatat"
            icon="shopping_bag"
            iconBg="bg-secondary-fixed/50"
            iconColor="text-secondary"
          />
          <KpiCard
            label="Transaksi Hari Ini"
            value={`${todayCount} transaksi`}
            sub="Berdasarkan tanggal transaksi"
            icon="today"
            iconBg="bg-tertiary-fixed"
            iconColor="text-tertiary"
          />
          <KpiCard
            label="Gedung Paling Aktif"
            value={activeLocation?.gedung ?? 'Belum ada transaksi'}
            sub={activeLocation ? `${activeLocation.transaksi} transaksi bulan ini` : 'Belum ada data bulan ini'}
            icon="domain"
            iconBg="bg-surface-container-high"
            iconColor="text-on-surface-variant"
          />
        </div>

        <div className="grid grid-cols-1 gap-space-lg xl:grid-cols-[1.6fr_0.9fr]">
          <SpendingByLocationChart data={chartData} period={currentMonth} />

          <div className="rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-space-lg shadow-level-1">
            <div className="mb-space-md flex items-center justify-between">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface">Pembagian Kategori</h3>
                <p className="mt-0.5 text-body-sm font-body-sm text-on-surface-variant">
                  Pengeluaran berdasarkan kategori bulan ini
                </p>
              </div>
              <span className="ms text-[20px] text-primary">pie_chart</span>
            </div>
            {topCategories.length ? (
              <div className="space-y-3">
                {topCategories.map(([label, amount]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-body-sm font-body-sm text-on-surface">{label}</span>
                      <span className="text-label-sm font-label-sm text-on-surface-variant tabular-nums">
                        {formatRupiah(amount)}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#ff7200] to-[#ffb77d]"
                        style={{ width: `${maxCategoryTotal ? (amount / maxCategoryTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-body-sm text-on-surface-variant">Belum ada transaksi bulan ini.</p>
            )}
          </div>
        </div>

        <section className="rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-space-lg shadow-level-1">
          <div className="mb-space-md flex items-center justify-between">
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Aktivitas Terbaru</h3>
              <p className="mt-0.5 text-body-sm font-body-sm text-on-surface-variant">
                Transaksi pembelian terbaru dari database
              </p>
            </div>
            <span className="ms text-[20px] text-primary">history</span>
          </div>
          {monthPurchases.length ? (
            <div className="space-y-3">
              {monthPurchases.slice(0, 5).map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#EEF2F7] bg-surface-container-low px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-body-md font-body-md font-semibold text-on-surface">
                      {purchase.items.map((item) => item.productName).join(', ') || purchase.transactionNumber}
                    </div>
                    <div className="mt-1 text-label-sm font-label-sm text-on-surface-variant">
                      {purchase.location.name} · {formatDate(purchase.date)} · {purchase.creator.name}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-body-md font-body-md font-semibold text-on-surface tabular-nums">
                      {formatRupiah(purchase.items.reduce((sum, item) => sum + Number(item.totalPrice), 0))}
                    </div>
                    <div className="text-label-sm font-label-sm text-on-surface-variant">
                      {purchase.transactionNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-body-sm text-on-surface-variant">Belum ada transaksi bulan ini.</p>
          )}
        </section>
      </div>
    </AppShell>
  )
}
