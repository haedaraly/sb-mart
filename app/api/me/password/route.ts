import bcrypt from 'bcryptjs'
import { getUser, j } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const sessionUser = getUser()
  if (!sessionUser) return j({ error: 'Belum login' }, 401)

  try {
    const body = await request.json()
    const currentPassword = String(body.currentPassword ?? '')
    const newPassword = String(body.newPassword ?? '')
    if (newPassword.length < 6) {
      return j({ error: 'Password baru minimal 6 karakter' }, 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, passwordHash: true },
    })
    if (!user || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
      return j({ error: 'Password saat ini tidak sesuai' }, 400)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: bcrypt.hashSync(newPassword, 10) },
    })
    return j({ ok: true })
  } catch (error) {
    console.error('Gagal mengubah password pengguna:', error)
    return j({ error: 'Gagal mengubah password' }, 500)
  }
}
