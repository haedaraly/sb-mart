# Sistem Pembelian & Pengeluaran LPI — Next.js + Prisma + PostgreSQL
Prasyarat: Node.js 20+, PostgreSQL 14+ (atau Docker).
1. `docker compose up -d`   (atau siapkan database sendiri)
2. `cp .env.example .env`   lalu ubah `DATABASE_URL` / `AUTH_SECRET`
3. `npm install`            (otomatis menjalankan `prisma generate`)
4. `npm run db:reset`       (membuat/ mereset tabel dari `prisma/schema.prisma`)
5. `npm run db:seed`        (master data, user demo, 110 transaksi contoh)
6. `npm run dev`            buka http://localhost:3000
Login demo: super/super123, admin/admin123, operator/operator123, viewer/viewer123 (ganti sebelum produksi).
Catatan: Excel daftar pembelian memakai ExcelJS (.xlsx, 2 sheet). Rekap bulanan/mingguan masih export HTML-xls. PDF lewat Print browser.
