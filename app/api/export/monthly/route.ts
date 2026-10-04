import ExcelJS from 'exceljs';
import { prisma } from '@/lib/db';
import { getUser, j } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export async function GET(r: Request) {
  if (!getUser()) return j({ error: 'Belum login' }, 401);
  const s = new URL(r.url).searchParams;
  const year = s.get('y') || String(new Date().getFullYear()),
    g = s.get('g'),
    c = s.get('c');

  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year}-12-31T23:59:59Z`);

  const [locations, ps] = await Promise.all([
    prisma.location.findMany({ orderBy: { code: 'asc' } }),
    prisma.purchase.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(g ? { location: { code: g } } : {}),
      },
      include: { items: true, location: true },
      orderBy: { date: 'asc' },
    }),
  ]);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Rekap Bulanan ${year}`);
  const rp = '"Rp"#,##0';

  const cols = [
    { key: 'g', header: 'Gedung / Unit', width: 26 },
    ...MON.map((m, i) => ({ key: `m${i + 1}`, header: m, width: 15 })),
    { key: 'total', header: 'Total Tahunan', width: 20 },
  ];
  ws.columns = cols;
  ws.getRow(1).font = { bold: true };

  const matrix: Record<string, { monthly: number[]; total: number }> = {};
  const activeLocations = locations.filter(l => !g || l.code === g);

  activeLocations.forEach(l => {
    matrix[l.code] = { monthly: Array(12).fill(0), total: 0 };
  });

  const monthTotals = Array(12).fill(0);
  let allTotal = 0;

  for (const p of ps) {
    const locCode = p.location.code;
    if (!matrix[locCode]) {
      matrix[locCode] = { monthly: Array(12).fill(0), total: 0 };
    }
    const mIdx = p.date.getMonth(); // 0 to 11

    for (const item of p.items) {
      if (c && item.categoryName !== c) continue;
      const t = Number(item.totalPrice);
      matrix[locCode].monthly[mIdx] += t;
      matrix[locCode].total += t;
      monthTotals[mIdx] += t;
      allTotal += t;
    }
  }

  for (const loc of activeLocations) {
    const data = matrix[loc.code];
    const rowObj: Record<string, any> = { g: loc.name };
    MON.forEach((_, i) => {
      rowObj[`m${i + 1}`] = data ? data.monthly[i] : 0;
    });
    rowObj.total = data ? data.total : 0;
    ws.addRow(rowObj);
  }

  const summaryRow: Record<string, any> = { g: 'TOTAL' };
  MON.forEach((_, i) => {
    summaryRow[`m${i + 1}`] = monthTotals[i];
  });
  summaryRow.total = allTotal;
  const lastRow = ws.addRow(summaryRow);
  lastRow.font = { bold: true };

  for (let i = 1; i <= 12; i++) {
    ws.getColumn(`m${i}`).numFmt = rp;
  }
  ws.getColumn('total').numFmt = rp;

  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  const filename = `rekap-bulanan-${year}${g ? '-' + g : ''}.xlsx`;
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
