import { getUser, j } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!getUser()) return j({ error: 'Belum login' }, 401)

  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      select: { code: true, name: true },
      orderBy: { name: 'asc' },
    })
    return j(locations)
  } catch (error) {
    console.error('Gagal memuat daftar gedung:', error)
    return j({ error: 'Gagal memuat daftar gedung' }, 500)
  }
}
