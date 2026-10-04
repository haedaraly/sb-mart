'use client'

import AppShell from '@/components/layout/AppShell'

export default function PengaturanPage() {
  return (
    <AppShell>
      <div className="flex flex-col w-full max-w-5xl">
        <div className="flex flex-col min-w-0 mb-space-xl">
          <div className="flex items-center gap-space-sm mb-1">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold px-2 py-0.5 rounded-full bg-primary-fixed/50">
              Konfigurasi Sistem
            </span>
            <span className="text-on-surface-variant text-label-sm font-label-sm">
              • Yayasan LPI
            </span>
          </div>
          <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight flex items-center gap-3">
            <span className="ms text-primary text-[32px]">settings</span>
            Pengaturan Sistem
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Pengaturan identitas lembaga, preferensi pembukuan kas kecil, dan aturan otorisasi.
          </p>
        </div>

        <div className="space-y-6">
          {/* Identitas Lembaga */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-[#E2E8F0]">
            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2 mb-4">
              <span className="ms text-primary text-[22px]">account_balance</span>
              Identitas Lembaga
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-label-md font-semibold text-on-surface">Nama Lembaga</label>
                <input
                  type="text"
                  readOnly
                  value="Lembaga Pendidikan Islam (LPI)"
                  className="mt-1 w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface border border-[#E2E8F0]"
                />
              </div>
              <div>
                <label className="text-label-md font-semibold text-on-surface">Tahun Fiskal Aktif</label>
                <input
                  type="text"
                  readOnly
                  value="2026/2027 (Berjalan)"
                  className="mt-1 w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface border border-[#E2E8F0]"
                />
              </div>
            </div>
          </div>

          {/* Aturan Pembukuan */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-[#E2E8F0]">
            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2 mb-4">
              <span className="ms text-secondary text-[22px]">receipt_long</span>
              Aturan Otorisasi Belanja
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <div>
                  <div className="font-semibold text-on-surface">Batas Maksimal Nota Kas Kecil Tanpa Disposisi</div>
                  <div className="text-body-sm text-on-surface-variant">Transaksi di atas nominal ini wajib ACC Bendahara</div>
                </div>
                <span className="font-table-cell-mono font-bold text-primary">Rp500.000</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <div>
                  <div className="font-semibold text-on-surface">Jadwal Tutup Kas Harian</div>
                  <div className="text-body-sm text-on-surface-variant">Sinkronisasi pembukuan setiap hari kerja</div>
                </div>
                <span className="font-semibold text-secondary">Pukul 17:00 WIB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
