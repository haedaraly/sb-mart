import { prisma } from '@/lib/db';
import { getUser, allow, j } from '@/lib/auth';
import { validate, items } from '@/lib/purchase';

export async function PUT(r: Request, { params }: { params: { id: string } }) {
  const u = getUser();
  if (!u || !allow(u, 'edit')) return j({ error: 'Tidak punya akses' }, 403);
  const b = await r.json(),
    e = validate(b);
  if (e) return j({ error: e }, 400);
  const id = +params.id;

  try {
    let updatedNo: string | undefined;
    await prisma.$transaction(async (tx: any) => {
      const existing = await tx.purchase.findUnique({ where: { id } });
      if (!existing) throw new Error('Transaksi tidak ditemukan');

      const l = await tx.location.findUnique({ where: { code: b.loc } });
      if (!l) throw new Error('Gedung tidak valid');

      const oldK = existing.date.toISOString().slice(0, 10).replace(/-/g, '');
      const newK = b.date.replace(/-/g, '');
      let transactionNumber = existing.transactionNumber;

      // Jika tanggal transaksi berubah, nomor transaksi dibuat ulang agar sesuai dengan tanggal baru
      if (oldK !== newK) {
        await tx.$executeRaw`select pg_advisory_xact_lock(42)`;
        const last = await tx.purchase.findFirst({
          where: { transactionNumber: { startsWith: `PB-${newK}-` } },
          orderBy: { transactionNumber: 'desc' },
        });
        const seq = (last ? +last.transactionNumber.slice(-3) : 0) + 1;
        transactionNumber = `PB-${newK}-${String(seq).padStart(3, '0')}`;
        updatedNo = transactionNumber;
      }

      await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
      await tx.purchase.update({
        where: { id },
        data: {
          transactionNumber,
          date: new Date(b.date),
          locationId: l.id,
          description: b.desc || '',
          updatedBy: u.id,
          items: { create: await items(tx, b.items) },
        },
      });
    });

    return j({ ok: 1, no: updatedNo });
  } catch (x: any) {
    return j({ error: 'Gagal menyimpan: ' + x.message }, 400);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const u = getUser();
  if (!u || !allow(u, 'del')) return j({ error: 'Tidak punya akses' }, 403);
  const id = +params.id;
  try {
    const existing = await prisma.purchase.findUnique({ where: { id } });
    if (!existing) return j({ error: 'Transaksi tidak ditemukan' }, 404);
    await prisma.purchase.delete({ where: { id } });
    return j({ ok: 1 });
  } catch {
    return j({ error: 'Gagal menghapus transaksi' }, 400);
  }
}
