'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ActiveFilter {
  key: string
  label: string
}

interface FilterPanelProps {
  onSearch: (val: string) => void
  onReset: () => void
}

const initialFilters: ActiveFilter[] = [
  { key: 'period', label: 'Periode: Oktober 2026' },
  { key: 'status', label: 'Status: Selesai' },
]

const gedungOptions = [
  'Semua Gedung',
  'Gedung Shofiyah - TU',
  'Gedung Umar - Matham',
  'Gedung Utsman - Asrama',
  'Copy Center & Percetakan',
  'Klinik Santri Sehat',
  "Masjid Jami' Putra",
]

const kategoriOptions = [
  'Semua Kategori',
  'ATK & Kertas',
  'Konsumsi & Dapur Santri',
  'Kebersihan & Sanitasi',
  'Perawatan Sarpras',
  'Buku & Modul Ajar',
  'Logistik Acara',
]

const operatorOptions = [
  'Semua Operator',
  'Ustadzah Sarah F.',
  'Ust. Mansyur H.',
  'Ust. Rahmat Hidayat',
  'Ahmad Fauzi (Logistik)',
  'Siti Maryam (Bendahara Unit)',
]

const selectClass =
  'w-full h-11 px-3 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer border-0 transition-all'

export default function FilterPanel({ onSearch, onReset }: FilterPanelProps) {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(initialFilters)

  function removeFilter(key: string) {
    setActiveFilters((f) => f.filter((x) => x.key !== key))
  }

  function handleReset() {
    setSearch('')
    setActiveFilters([])
    onReset()
  }

  function handleSearch(val: string) {
    setSearch(val)
    onSearch(val)
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-[#E2E8F0] p-space-lg mb-space-lg">
      {/* Filter controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-end">
        {/* Search */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <label className="text-label-md font-label-md font-semibold text-on-surface">
            Pencarian Cepat
          </label>
          <div className="relative w-full">
            <span className="ms absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all"
              id="searchInput"
              placeholder="Cari nomor transaksi, nama barang, atau keterangan..."
              type="text"
            />
          </div>
        </div>

        {/* Date range */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label className="text-label-md font-label-md font-semibold text-on-surface">
            Rentang Tanggal
          </label>
          <div className="relative w-full">
            <span className="ms absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[18px]">
              calendar_month
            </span>
            <input
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface cursor-pointer focus:outline-none"
              readOnly
              type="text"
              defaultValue="01 Okt 2026 - 31 Okt 2026"
            />
          </div>
        </div>

        {/* Gedung */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label className="text-label-md font-label-md font-semibold text-on-surface">
            Gedung / Lokasi
          </label>
          <select className={selectClass}>
            {gedungOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Kategori */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label className="text-label-md font-label-md font-semibold text-on-surface">
            Kategori Belanja
          </label>
          <select className={selectClass}>
            {kategoriOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Operator + Reset */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-label-md font-label-md font-semibold text-on-surface">
              Operator Input
            </label>
            <select className={selectClass}>
              {operatorOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleReset}
            className="h-11 px-3 mt-auto rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-dim hover:text-on-surface transition-all flex items-center justify-center"
            title="Reset Semua Filter"
            type="button"
          >
            <span className="ms text-[20px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      {/* Active filter pills */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-md mt-space-md border-t border-[#E2E8F0]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
            Filter Aktif:
          </span>
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-md font-label-md font-semibold"
            >
              {f.label}
              <button
                onClick={() => removeFilter(f.key)}
                className="hover:text-primary transition-colors leading-none"
                type="button"
              >
                <span className="ms text-[14px]">close</span>
              </button>
            </span>
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-label-md font-label-md text-primary hover:underline ml-1"
              type="button"
            >
              Hapus Semua
            </button>
          )}
        </div>

        <div className="flex items-center gap-space-sm text-on-surface-variant text-body-sm font-body-sm">
          <span className="ms text-[16px] text-secondary">verified</span>
          <span>Data sinkron dengan Jurnal Kas Utama (LPI Keuangan)</span>
        </div>
      </div>
    </div>
  )
}
