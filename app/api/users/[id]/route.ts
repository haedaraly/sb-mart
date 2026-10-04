import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getUser, j } from '@/lib/auth';

export async function PUT(r: Request, { params }: { params: { id: string } }) {
  const u = getUser();
  if (u?.role !== 'Super Admin') return j({ error: 'Tidak punya akses' }, 403);
  const b = await r.json(),
    id = +params.id;
  if (!b.name?.trim() || !['Super Admin', 'Admin', 'Operator'].includes(b.role)) {
    return j({ error: 'Data tidak valid' }, 400);
  }
  if (u!.id == id && (!b.on || b.role !== 'Super Admin')) {
    return j({ error: 'Tidak dapat menonaktifkan atau menurunkan role akun sendiri' }, 400);
  }
  const d: any = {
    name: b.name.trim(),
    email: b.email?.trim() || null,
    role: b.role,
    isActive: !!b.on,
  };
  if (b.password) {
    if (b.password.length < 6) return j({ error: 'Password min. 6 karakter' }, 400);
    d.passwordHash = bcrypt.hashSync(b.password, 10);
  }
  try {
    await prisma.user.update({ where: { id }, data: d });
    return j({ ok: 1 });
  } catch {
    return j({ error: 'Pengguna tidak ditemukan' }, 404);
  }
}

export async function DELETE(r: Request, { params }: { params: { id: string } }) {
  const u = getUser();
  if (u?.role !== 'Super Admin') return j({ error: 'Tidak punya akses' }, 403);
  const id = +params.id;
  if (u!.id == id) {
    return j({ error: 'Tidak dapat menghapus akun sendiri' }, 400);
  }
  try {
    await prisma.user.delete({ where: { id } });
    return j({ ok: 1 });
  } catch {
    // If foreign key exists (e.g. created purchases), deactivate instead
    try {
      await prisma.user.update({ where: { id }, data: { isActive: false } });
      return j({ ok: 1, softDeleted: true });
    } catch (e: any) {
      return j({ error: 'Gagal menghapus pengguna: ' + e.message }, 400);
    }
  }
}
