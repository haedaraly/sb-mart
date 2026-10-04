import { prisma } from '@/lib/db';
import { getUser, allow, j } from '@/lib/auth';
import { saveMaster } from '@/lib/master';

export const dynamic = 'force-dynamic';

export async function GET(r: Request, { params }: { params: { k: string } }) {
  const user = getUser();
  if (!user) return j({ error: 'Belum login' }, 401);
  if (!allow(user, 'master')) return j({ error: 'Tidak punya akses' }, 403);

  const M: any = {
    locations: prisma.location,
    categories: prisma.category,
    units: prisma.unit,
    products: prisma.product,
  };
  const m = M[params.k];
  if (!m) return j({ error: 'Master tidak dikenal' }, 404);

  try {
    if (params.k === 'products') {
      const items = await prisma.product.findMany({
        include: { category: true, unit: true },
        orderBy: { name: 'asc' },
      });
      return j(
        items.map((x) => ({
          id: x.id,
          code: x.code || '',
          name: x.name,
          category: x.category.name,
          unit: x.unit.name,
          price: Number(x.defaultPrice),
          isActive: x.isActive,
        }))
      );
    }

    const items = await m.findMany({ orderBy: { name: 'asc' } });
    return j(items);
  } catch (e: any) {
    return j({ error: e.message }, 500);
  }
}

export async function POST(r: Request, { params }: { params: { k: string } }) {
  if (!allow(getUser(), 'master')) return j({ error: 'Tidak punya akses' }, 403);
  try {
    await saveMaster(params.k, await r.json());
    return j({ ok: 1 });
  } catch (e: any) {
    return j({ error: e.message }, 400);
  }
}
