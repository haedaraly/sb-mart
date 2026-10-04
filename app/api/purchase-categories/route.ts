import { getUser, j } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!getUser()) return j({ error: 'Belum login' }, 401)

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { name: true },
      orderBy: { name: 'asc' },
    })
    return j(categories.map((category) => category.name))
  } catch (error) {
    console.error('Gagal memuat kategori pembelian:', error)
    return j({ error: 'Gagal memuat kategori pembelian' }, 500)
  }
}
