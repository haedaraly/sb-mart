import { Prisma } from '@prisma/client';
import { prisma } from './db';

export async function saveMaster(k: string, b: any, id?: string) {
  const M: any = {
    locations: prisma.location,
    categories: prisma.category,
    units: prisma.unit,
    products: prisma.product,
  };
  const m = M[k];
  if (!m) throw new Error('Master tidak dikenal');
  const n = (b.name || '').trim(),
    isActive = !!b.on;
  if (!n) throw new Error('Nama wajib diisi');
  let d: any;
  if (k == 'locations') {
    d = { code: b.code, name: n, description: b.description || '', isActive };
  } else if (k == 'products') {
    const c = await prisma.category.findUnique({ where: { name: b.category } });
    const u = await prisma.unit.findUnique({ where: { name: b.unit } });
    if (!c || !u) throw new Error('Kategori/satuan tidak ditemukan');
    const defaultPrice =
      b.price !== undefined && b.price !== ''
        ? new Prisma.Decimal(String(b.price))
        : new Prisma.Decimal(0);
    d = { code: b.code || '', name: n, categoryId: c.id, unitId: u.id, defaultPrice, isActive };
  } else if (k == 'categories') {
    d = { name: n, description: b.description || '', isActive };
  } else if (k == 'units') {
    d = { name: n, symbol: b.symbol || '', isActive };
  } else {
    d = { name: n, isActive };
  }
  return id ? m.update({ where: { id: +id }, data: d }) : m.create({ data: d });
}
