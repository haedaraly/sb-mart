import { prisma } from '@/lib/db'
import { getUser, j } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function isDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export async function GET(request: Request) {
  const user = getUser()
  if (!user) return j({ error: 'Belum login' }, 401)
  if (!['Super Admin', 'Admin'].includes(user.role)) return j({ error: 'Tidak punya akses' }, 403)

  const params = new URL(request.url).searchParams
  const from = params.get('from')
  const to = params.get('to')
  if (!isDate(from) || !isDate(to) || from > to) {
    return j({ error: 'Rentang tanggal tidak valid' }, 400)
  }

  const startDate = new Date(`${from}T00:00:00.000Z`)
  const endDate = new Date(`${to}T00:00:00.000Z`)
  endDate.setUTCDate(endDate.getUTCDate() + 1)
  const locationCode = params.get('g') || undefined
  const categoryName = params.get('c') || undefined

  try {
    const [locations, categories, purchases] = await Promise.all([
      prisma.location.findMany({
        where: { isActive: true },
        select: { code: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.purchase.findMany({
        where: {
          date: { gte: startDate, lt: endDate },
          ...(locationCode ? { location: { code: locationCode } } : {}),
        },
        include: { location: true, creator: true, items: true },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
      }),
    ])

    const rows = purchases.flatMap((purchase) => {
      const matchedItems = categoryName
        ? purchase.items.filter((item) => item.categoryName === categoryName)
        : purchase.items
      if (!matchedItems.length) return []

      return [{
        id: purchase.id,
        no: purchase.transactionNumber,
        date: new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(purchase.date),
        location: purchase.location.name,
        operator: purchase.creator.name,
        itemCount: matchedItems.length,
        total: matchedItems.reduce((sum, item) => sum + Number(item.totalPrice), 0),
      }]
    })

    return j({
      rows,
      locations,
      categories: categories.map((category) => category.name),
      total: rows.reduce((sum, row) => sum + row.total, 0),
    })
  } catch (error) {
    console.error('Gagal memuat rekap mingguan:', error)
    return j({ error: 'Gagal memuat rekap mingguan' }, 500)
  }
}
