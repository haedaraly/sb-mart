import { prisma } from '@/lib/db';
import { getUser, allow, j } from '@/lib/auth';
import { saveMaster } from '@/lib/master';

export const dynamic = 'force-dynamic';

export async function PUT(
  r: Request,
  { params }: { params: { k: string; id: string } }
) {
  if (!allow(getUser(), 'master')) return j({ error: 'Tidak punya akses' }, 403);
  try {
    await saveMaster(params.k, await r.json(), params.id);
    return j({ ok: 1 });
  } catch (e: any) {
    return j({ error: e.message }, 400);
  }
}

export async function DELETE(
  r: Request,
  { params }: { params: { k: string; id: string } }
) {
  if (!allow(getUser(), 'master')) return j({ error: 'Tidak punya akses' }, 403);
  const M: any = {
    locations: prisma.location,
    categories: prisma.category,
    units: prisma.unit,
    products: prisma.product,
  };
  const m = M[params.k];
  if (!m) return j({ error: 'Master tidak dikenal' }, 404);

  try {
    await m.delete({ where: { id: +params.id } });
    return j({ ok: 1 });
  } catch {
    // If foreign key constraint prevents hard delete, soft delete by setting isActive = false
    try {
      await m.update({ where: { id: +params.id }, data: { isActive: false } });
      return j({ ok: 1, softDeleted: true });
    } catch (e: any) {
      return j({ error: 'Gagal menghapus data: ' + e.message }, 400);
    }
  }
}
