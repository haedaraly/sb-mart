import { getUser, j } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic='force-dynamic';

export async function GET() {
  const sessionUser = getUser()
  if (!sessionUser) return j({ error: 'Belum login' }, 401)

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, name: true, username: true, email: true, role: true },
    })
    return user ? j(user) : j({ error: 'Pengguna tidak ditemukan' }, 404)
  } catch (error) {
    console.error('Gagal memuat profil pengguna:', error)
    return j({ error: 'Gagal memuat profil pengguna' }, 500)
  }
}
