'use client'

import AppShell from '@/components/layout/AppShell'
import { TRANSACTIONS, formatRupiah } from '@/lib/data/transactions'

export default function RekapBulananPage() {
  const total = TRANSACTIONS.reduce((acc, t) => acc + t.totalNominal, 0)

  return (
    <AppShell>
      <div className="flex flex-col w-full max-w-5xl">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold px-2 py-0.5 rounded-full bg-primary-fixed/50">
                Laporan Tutup Buku
              </span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                • Rekap Bulanan
              </span>
            </div>
            <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight flex items-center gap-3">
              <span className="ms text-primary text-[32px]">calendar_month</span>
              Rekap Pembelian Bulanan
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">
              Akumulasi pengeluaran dan laporan realisasi anggaran per bulan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/monthly"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-semibold shadow-level-1 hover:bg-surface-container-low transition-all border border-[#E2E8F0]"
            >
              <span className="ms text-[18px] text-primary">download</span>
              Export Excel Bulanan
            </a>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-space-lg">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#E2E8F0] shadow-level-1">
            <span className="text-label-md text-on-surface-variant font-medium">Total Pengeluaran Bulan Ini</span>
            <div className="text-headline-lg font-bold text-primary mt-1 font-mono">{formatRupiah(total)}</div>
          </div>
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#E2E8F0] shadow-level-1">
            <span className="text-label-md text-on-surface-variant font-medium">Realisasi Anggaran</span>
            <div className="text-headline-lg font-bold text-secondary mt-1">68.4% Terpakai</div>
          </div>
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#E2E8F0] shadow-level-1">
            <span className="text-label-md text-on-surface-variant font-medium">Sisa Plafon Kas Kecil</span>
            <div className="text-headline-lg font-bold text-on-surface mt-1 font-mono">
              Rp21.770.000
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-5 rounded-2xl bg-primary-fixed/20 border border-primary-fixed/50 flex items-start gap-3">
          <span className="ms text-primary text-[24px]">info</span>
          <div>
            <div className="font-semibold text-on-surface">Pemberitahuan Tutup Buku Kas</div>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Laporan tutup buku bulanan diverifikasi langsung oleh Bagian Keuangan &amp; Yayasan LPI pada akhir hari kerja setiap bulan.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
