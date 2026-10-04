import { prisma } from '@/lib/db'
import { getUser, j } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export async function GET(request: Request) {
  const user = getUser()
  if (!user) return j({ error: 'Belum login' }, 401)
  if (!['Super Admin', 'Admin'].includes(user.role)) return j({ error: 'Tidak punya akses' }, 403)

  const yearParam = new URL(request.url).searchParams.get('y') || String(new Date().getFullYear())
  if (!/^\d{4}$/.test(yearParam) || Number(yearParam) < 1000) {
    return j({ error: 'Tahun tidak valid' }, 400)
  }

  const year = Number(yearParam)
  const startDate = new Date(Date.UTC(year, 0, 1))
  const endDate = new Date(Date.UTC(year + 1, 0, 1))

  try {
    const [locations, purchases] = await Promise.all([
      prisma.location.findMany({ orderBy: { code: 'asc' } }),
      prisma.purchase.findMany({
        where: { date: { gte: startDate, lt: endDate } },
        include: { items: true, location: true },
      }),
    ])

    const rowsByLocation = new Map(
      locations.map((location) => [
        location.id,
        { location: location.name, monthly: Array(12).fill(0) as number[], total: 0 },
      ])
    )

    for (const purchase of purchases) {
      const row = rowsByLocation.get(purchase.locationId)
      if (!row) continue
      const monthIndex = purchase.date.getUTCMonth()
      for (const item of purchase.items) {
        const amount = Number(item.totalPrice)
        row.monthly[monthIndex] += amount
        row.total += amount
      }
    }

    const rows = Array.from(rowsByLocation.values())
    const totals = MONTHS.map((_, index) =>
      rows.reduce((sum, row) => sum + row.monthly[index], 0)
    )

    return j({
      months: MONTHS,
      rows,
      totals,
      grandTotal: rows.reduce((sum, row) => sum + row.total, 0),
    })
  } catch (error) {
    console.error('Gagal memuat rekap bulanan:', error)
    return j({ error: 'Gagal memuat rekap bulanan' }, 500)
  }
}
