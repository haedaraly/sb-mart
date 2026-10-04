import ExcelJS from 'exceljs';
import { prisma } from '@/lib/db';
import { getUser, j } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(r: Request) {
  const user = getUser();
  if (!user) return j({ error: 'Belum login' }, 401);
  if (!['Super Admin', 'Admin'].includes(user.role)) return j({ error: 'Tidak punya akses' }, 403);
  const s = new URL(r.url).searchParams;
  const a = s.get('a'),
    b = s.get('b'),
    g = s.get('g'),
    c = s.get('c');

  const ps = await prisma.purchase.findMany({
    where: {
      ...(a || b ? { date: { ...(a ? { gte: new Date(a) } : {}), ...(b ? { lte: new Date(b) } : {}) } } : {}),
      ...(g ? { location: { code: g } } : {}),
    },
    include: { items: true, location: true, creator: true },
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
  });

  const wb = new ExcelJS.Workbook();
  const rp = '"Rp"#,##0';

  // Sheet 1: Rekap per Gedung
  const ws1 = wb.addWorksheet('Rekap per Gedung');
  ws1.columns = [
    { key: 'g', header: 'Gedung / Unit', width: 28 },
    { key: 'trx', header: 'Jumlah Transaksi', width: 18 },
    { key: 'items', header: 'Total Item', width: 14 },
    { key: 'total', header: 'Total Pengeluaran', width: 22 },
  ];
  ws1.getRow(1).font = { bold: true };

  const byGedung: Record<string, { trxSet: Set<number>; itemsCount: number; total: number }> = {};
  let grandTotal = 0;
  let totalItemsCount = 0;
  const allTrxSet = new Set<number>();

  for (const p of ps) {
    for (const i of p.items) {
      if (c && i.categoryName !== c) continue;
      const t = Number(i.totalPrice);
      const loc = p.location.name;
      if (!byGedung[loc]) {
        byGedung[loc] = { trxSet: new Set(), itemsCount: 0, total: 0 };
      }
      byGedung[loc].trxSet.add(p.id);
      byGedung[loc].itemsCount += 1;
      byGedung[loc].total += t;

      allTrxSet.add(p.id);
      totalItemsCount += 1;
      grandTotal += t;
    }
  }

  for (const [locName, stat] of Object.entries(byGedung)) {
    ws1.addRow({
      g: locName,
      trx: stat.trxSet.size,
      items: stat.itemsCount,
      total: stat.total,
    });
  }

  const rTotal = ws1.addRow({
    g: 'TOTAL KESELURUHAN',
    trx: allTrxSet.size,
    items: totalItemsCount,
    total: grandTotal,
  });
  rTotal.font = { bold: true };
  ws1.getColumn('total').numFmt = rp;

  // Sheet 2: Rincian Transaksi
  const ws2 = wb.addWorksheet('Rincian Transaksi');
  ws2.columns = [
    { key: 'no', header: 'No. Transaksi', width: 20 },
    { key: 'd', header: 'Tanggal', width: 16 },
    { key: 'g', header: 'Gedung', width: 24 },
    { key: 'by', header: 'Operator', width: 16 },
    { key: 'item', header: 'Barang', width: 26 },
    { key: 'cat', header: 'Kategori', width: 14 },
    { key: 'qty', header: 'Qty', width: 10 },
    { key: 'unit', header: 'Satuan', width: 10 },
    { key: 'price', header: 'Harga Satuan', width: 16 },
    { key: 'total', header: 'Total', width: 18 },
  ];
  ws2.getRow(1).font = { bold: true };

  for (const p of ps) {
    for (const i of p.items) {
      if (c && i.categoryName !== c) continue;
      ws2.addRow({
        no: p.transactionNumber,
        d: p.date,
        g: p.location.name,
        by: p.creator.name,
        item: i.productName,
        cat: i.categoryName,
        qty: Number(i.qty),
        unit: i.unitName,
        price: Number(i.unitPrice),
        total: Number(i.totalPrice),
      });
    }
  }
  ws2.getColumn('price').numFmt = rp;
  ws2.getColumn('total').numFmt = rp;
  ws2.getColumn('d').numFmt = 'dd mmmm yyyy';

  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  const filename = `rekap-mingguan-${a || 'all'}-sd-${b || 'all'}.xlsx`;
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
