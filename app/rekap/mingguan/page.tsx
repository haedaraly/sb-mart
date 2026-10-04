'use client'

import AppShell from '@/components/layout/AppShell'
import { TRANSACTIONS, formatRupiah } from '@/lib/data/transactions'

export default function RekapMingguanPage() {
  const total = TRANSACTIONS.reduce((acc, t) => acc + t.totalNominal, 0)

  return (
    <AppShell>
      <div className="flex flex-col w-full max-w-5xl">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-secondary font-semibold px-2 py-0.5 rounded-full bg-secondary-fixed/50">
                Laporan Kas Operasional
              </span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                • Rekap Mingguan
              </span>
            </div>
            <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight flex items-center gap-3">
              <span className="ms text-secondary text-[32px]">analytics</span>
              Rekap Pembelian Mingguan
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">
              Ringkasan pergerakan belanja operasional unit dan gedung LPI per minggu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/weekly"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-semibold shadow-level-1 hover:bg-surface-container-low transition-all border border-[#E2E8F0]"
            >
              <span className="ms text-[18px] text-secondary">download</span>
              Export Excel
            </a>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-space-lg">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#E2E8F0] shadow-level-1">
            <span className="text-label-md text-on-surface-variant font-medium">Total Belanja Periode Ini</span>
            <div className="text-headline-lg font-bold text-primary mt-1 font-mono">{formatRupiah(total)}</div>
          </div>
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#E2E8F0] shadow-level-1">
            <span className="text-label-md text-on-surface-variant font-medium">Jumlah Transaksi</span>
            <div className="text-headline-lg font-bold text-secondary mt-1">{TRANSACTIONS.length} Nota</div>
          </div>
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#E2E8F0] shadow-level-1">
            <span className="text-label-md text-on-surface-variant font-medium">Rata-rata per Nota</span>
            <div className="text-headline-lg font-bold text-on-surface mt-1 font-mono">
              {formatRupiah(Math.round(total / (TRANSACTIONS.length || 1)))}
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-[#E2E8F0] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-headline-sm font-semibold text-on-surface">Daftar Transaksi Terakhir</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-surface-container-low/50 text-label-md font-label-md text-on-surface-variant">
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  <th className="py-3.5 px-4">No. Transaksi</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Gedung / Lokasi</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-body-md font-body-md text-on-surface">
                {TRANSACTIONS.slice(0, 8).map((t, idx) => (
                  <tr key={t.id} className="hover:bg-surface-container-low/50">
                    <td className="py-3 px-4 text-center text-on-surface-variant">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-medium text-primary">{t.noTransaksi}</td>
                    <td className="py-3 px-4">{t.tanggal}</td>
                    <td className="py-3 px-4">{t.lokasi}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{formatRupiah(t.totalNominal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
