import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getUser, j } from '@/lib/auth';
const ROLES = ['Super Admin', 'Admin', 'Operator', 'Viewer'];
export const dynamic = 'force-dynamic';

export async function GET() {
  const u = getUser();
  if (!u) return j({ error: 'Tidak punya akses' }, 403);
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
    return j(users);
  } catch (e: any) {
    return j({ error: e.message }, 500);
  }
}

export async function POST(r: Request) {
  if (getUser()?.role !== 'Super Admin') return j({ error: 'Tidak punya akses' }, 403);
  const b = await r.json();
  if (!b.username?.trim() || !b.name?.trim() || !ROLES.includes(b.role) || (b.password || '').length < 6) {
    return j({ error: 'Data tidak valid (password min. 6 karakter, role harus sesuai)' }, 400);
  }
  try {
    await prisma.user.create({
      data: {
        username: b.username.trim(),
        name: b.name.trim(),
        email: b.email?.trim() || null,
        role: b.role,
        passwordHash: bcrypt.hashSync(b.password, 10),
        isActive: !!b.on,
      },
    });
    return j({ ok: 1 });
  } catch {
    return j({ error: 'Username sudah dipakai' }, 400);
  }
}
