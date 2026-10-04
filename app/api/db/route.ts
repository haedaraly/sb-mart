import { prisma } from '@/lib/db';
import { getUser, j } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const u = getUser();
  if (!u) return j({ error: 'Belum login' }, 401);
  const o = { orderBy: { id: 'asc' as const } },
    on = (x: any) => (x.isActive ? 1 : 0);
  const [l, c, n, pr, pu, us] = await Promise.all([
    prisma.location.findMany(o),
    prisma.category.findMany(o),
    prisma.unit.findMany(o),
    prisma.product.findMany({ ...o, include: { category: true, unit: true } }),
    prisma.purchase.findMany({
      include: { items: { orderBy: { id: 'asc' } }, location: true, creator: true, updater: true },
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
    }),
    prisma.user.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return j({
    locations: l.map(x => ({ id: x.id, code: x.code, name: x.name, description: x.description || '', on: on(x) })),
    categories: c.map(x => ({ id: x.id, name: x.name, description: x.description || '', on: on(x) })),
    units: n.map(x => ({ id: x.id, name: x.name, symbol: x.symbol || '', on: on(x) })),
    products: pr.map(x => ({
      id: x.id,
      code: x.code || '',
      name: x.name,
      category: x.category.name,
      unit: x.unit.name,
      price: Number(x.defaultPrice),
      on: on(x),
    })),
    purchases: pu.map(x => ({
      id: x.id,
      no: x.transactionNumber,
      date: x.date.toISOString().slice(0, 10),
      loc: x.location.code,
      desc: x.description,
      createdById: x.createdBy,
      by: x.creator.name,
      upd: x.updater?.name,
      items: x.items.map(i => ({
        productId: i.productId,
        name: i.productName,
        cat: i.categoryName,
        qty: Number(i.qty),
        unit: i.unitName,
        price: Number(i.unitPrice),
      })),
    })),
    users: (us as any[]).map(x => ({
      id: x.id,
      username: u.role === 'Super Admin' ? x.username : undefined,
      name: x.name,
      email: x.email || '',
      role: x.role,
      on: on(x),
    })),
  });
}
