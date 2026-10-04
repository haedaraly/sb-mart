import { Prisma } from '@prisma/client';

export function validate(b: any) {
  if (!b?.date || !b?.loc) return 'Tanggal dan gedung wajib diisi';
  if (!Array.isArray(b.items) || !b.items.length) return 'Minimal satu item';
  for (const i of b.items) {
    if (!String(i.name || '').trim()) return 'Nama barang wajib diisi';
    if (!String(i.cat || '').trim()) return 'Kategori wajib dipilih';
    if (!(Number(i.qty) > 0)) return 'Qty harus lebih dari 0';
    if (!(Number(i.price) >= 0)) return 'Harga tidak boleh negatif';
  }
  return '';
}

export async function items(tx: any, a: any[]) {
  const o: any[] = [];
  for (const i of a) {
    const n = String(i.name || '').trim();
    let p: any = null;
    if (i.productId) {
      p = await tx.product.findUnique({
        where: { id: Number(i.productId) },
        include: { category: true, unit: true },
      });
    }
    if (!p && n) {
      p = await tx.product.findFirst({
        where: { name: n },
        include: { category: true, unit: true },
      });
    }

    const qty = new Prisma.Decimal(String(i.qty ?? 0));
    const unitPrice = new Prisma.Decimal(String(i.price ?? 0));
    const totalPrice = qty.mul(unitPrice);

    o.push({
      productId: p ? p.id : null,
      productName: n || (p ? p.name : ''),
      categoryName: i.cat || p?.category?.name || 'Lainnya',
      unitName: i.unit || p?.unit?.name || 'pcs',
      qty,
      unitPrice,
      totalPrice,
    });
  }
  return o;
}
