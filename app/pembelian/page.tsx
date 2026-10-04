'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import KpiCard from '@/components/ui/KpiCard'
import FilterPanel from '@/components/pembelian/FilterPanel'
import TransactionTable from '@/components/pembelian/TransactionTable'
import SpendingByLocationChart from '@/components/charts/SpendingByLocationChart'
import InfoCards from '@/components/pembelian/InfoCards'
import { TRANSACTIONS } from '@/lib/data/transactions'

export default function DaftarPembelianPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <AppShell>
      <div className="flex flex-col w-full">
        {/* ── Page header ─────────────────────────────── */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold px-2 py-0.5 rounded-full bg-primary-fixed/50">
                Fiskal Aktif 2026/2027
              </span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                • Buku Induk Kas Operasional
              </span>
            </div>
            <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight">
              Daftar Pembelian
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1 max-w-3xl">
              Kelola dan pantau seluruh transaksi pembelian operasional unit dan
              gedung LPI secara akuntabel, tertib, dan transparan.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-headline-sm font-headline-sm shadow-level-1 hover:bg-surface-container-low hover:shadow-level-2 transition-all border border-[#E2E8F0]"
              type="button"
            >
              <span className="ms text-[18px] text-primary">print</span>
              <span>Cetak Laporan</span>
            </button>
            <a
              href="/api/export/purchases"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-headline-sm font-headline-sm shadow-level-1 hover:bg-surface-container-low hover:shadow-level-2 transition-all border border-[#E2E8F0]"
            >
              <span className="ms text-[18px] text-secondary">table_view</span>
              <span>Export Excel</span>
            </a>
            <Link
              href="/pembelian/tambah"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-headline-sm font-headline-sm shadow-level-2 hover:bg-[#E66700] hover:shadow-level-3 transition-all active:scale-[0.99]"
            >
              <span className="ms text-[20px]">add_circle</span>
              <span>+ Tambah Pembelian</span>
            </Link>
          </div>
        </div>

        {/* ── KPI Cards ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md mb-space-lg">
          <KpiCard
            label="Total Belanja Bulan Ini"
            value="Rp48.230.000"
            sub={
              <>
                <span className="inline-flex items-center text-secondary text-label-md font-label-md font-semibold">
                  <span className="ms text-[16px]">trending_down</span>
                  &nbsp;4.2%
                </span>
                <span>vs September 2026</span>
              </>
            }
            icon="receipt_long"
            iconBg="bg-primary-fixed/40"
            iconColor="text-primary"
          />
          <KpiCard
            label="Transaksi Selesai"
            value={
              <>
                <span className="text-secondary">118</span>
                <span className="text-body-md font-body-md text-on-surface-variant font-normal ml-1">
                  Nota
                </span>
              </>
            }
            sub="93.6% terverifikasi bendahara"
            icon="check_circle"
            iconBg="bg-secondary-fixed/50"
            iconColor="text-secondary"
          />
          <KpiCard
            label="Menunggu Verifikasi"
            value={
              <>
                <span className="text-[#e88219]">8</span>
                <span className="text-body-md font-body-md text-on-surface-variant font-normal ml-1">
                  Faktur
                </span>
              </>
            }
            sub={
              <>
                <span className="ms text-[14px] text-tertiary">schedule</span>
                <span className="text-tertiary font-medium">Perlu ACC Keuangan</span>
              </>
            }
            icon="pending_actions"
            iconBg="bg-tertiary-fixed"
            iconColor="text-tertiary"
          />
          <KpiCard
            label="Gedung Paling Aktif"
            value={
              <span className="text-headline-md font-headline-md text-on-surface">
                Gedung Shofiyah
              </span>
            }
            sub={
              <>
                <span className="font-semibold text-primary">34 transaksi</span>
                <span className="ml-1">(Unit TU &amp; Lab)</span>
              </>
            }
            icon="domain"
            iconBg="bg-surface-container-high"
            iconColor="text-on-surface-variant"
          />
        </div>

        {/* ── Chart ──────────────────────────────────── */}
        <div className="mb-space-lg">
          <SpendingByLocationChart />
        </div>

        {/* ── Filter Panel ───────────────────────────── */}
        <FilterPanel
          onSearch={setSearchQuery}
          onReset={() => setSearchQuery('')}
        />

        {/* ── Transaction Table ──────────────────────── */}
        <TransactionTable
          transactions={TRANSACTIONS}
          searchQuery={searchQuery}
        />

        {/* ── Info cards ─────────────────────────────── */}
        <div className="mt-space-lg">
          <InfoCards />
        </div>
      </div>
    </AppShell>
  )
}
