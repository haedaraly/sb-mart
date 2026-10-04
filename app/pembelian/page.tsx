'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import KpiCard from '@/components/ui/KpiCard'
import FilterPanel, { type TransactionFilters } from '@/components/pembelian/FilterPanel'
import TransactionTable from '@/components/pembelian/TransactionTable'
import SpendingByLocationChart from '@/components/charts/SpendingByLocationChart'
import InfoCards from '@/components/pembelian/InfoCards'
import { formatRupiah, type Transaction } from '@/lib/data/transactions'
import { useToast } from '@/components/ui/Toast'

function dateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const now = new Date()
const defaultFilters: TransactionFilters = {
  search: '',
  from: dateValue(new Date(now.getFullYear(), now.getMonth(), 1)),
  to: dateValue(now),
  location: '',
  category: '',
  operator: '',
}

export default function DaftarPembelianPage() {
  const { error: toastError } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters)
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/purchases', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal memuat transaksi.')
      setTransactions(result as Transaction[])
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Gagal memuat transaksi.')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const filteredTransactions = useMemo(() => {
    const query = filters.search.trim().toLocaleLowerCase('id-ID')
    return transactions.filter((transaction) => {
      if (filters.from && (transaction.tanggalISO ?? '') < filters.from) return false
      if (filters.to && (transaction.tanggalISO ?? '') > filters.to) return false
      if (filters.location && transaction.lokasi !== filters.location) return false
      if (filters.operator && transaction.operatorNama !== filters.operator) return false
      if (filters.category && !transaction.items.some((item) => item.kategori === filters.category)) return false
      if (!query) return true
      const searchable = [
        transaction.noTransaksi,
        transaction.lokasi,
        transaction.operatorNama,
        transaction.description,
        ...transaction.items.flatMap((item) => [item.nama, item.kategori]),
      ].join(' ').toLocaleLowerCase('id-ID')
      return searchable.includes(query)
    })
  }, [filters, transactions])

  const currentMonthTransactions = transactions.filter((transaction) =>
    transaction.tanggalISO?.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  )
  const currentMonthTotal = currentMonthTransactions.reduce((sum, transaction) => sum + transaction.totalNominal, 0)
  const locationData = useMemo(() => {
    const map = new Map<string, { gedung: string; total: number; transaksi: number }>()
    for (const transaction of currentMonthTransactions) {
      const entry = map.get(transaction.lokasi) ?? { gedung: transaction.lokasi, total: 0, transaksi: 0 }
      entry.total += transaction.totalNominal
      entry.transaksi += 1
      map.set(transaction.lokasi, entry)
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [transactions])

  const filterOptions = useMemo(() => ({
    locations: [...new Set(transactions.map((transaction) => transaction.lokasi))].sort(),
    categories: [...new Set(transactions.flatMap((transaction) => transaction.items.map((item) => item.kategori).filter((category): category is string => !!category)))].sort(),
    operators: [...new Set(transactions.map((transaction) => transaction.operatorNama))].sort(),
  }), [transactions])

  const activeLocation = [...locationData].sort((a, b) => b.transaksi - a.transaksi)[0]
  const period = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now)

  return (
    <AppShell>
      <div className="flex flex-col w-full">
        <div className="mb-space-xl flex flex-col gap-space-lg xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 flex-col">
            <div className="mb-1 flex items-center gap-space-sm">
              <span className="rounded-full bg-primary-fixed/50 px-2 py-0.5 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-primary">
                Data Transaksi
              </span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">• Buku Induk Kas Operasional</span>
            </div>
            <h1 className="text-display-lg font-display-lg tracking-tight text-on-surface">Daftar Pembelian</h1>
            <p className="mt-1 max-w-3xl text-body-md font-body-md text-on-surface-variant">
              Data transaksi pembelian yang tersimpan di sistem.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-surface-container-lowest px-4 py-2.5 font-semibold text-on-surface shadow-level-1 transition-all hover:bg-surface-container-low"
              type="button"
            >
              <span className="ms text-[18px] text-primary">print</span>
              Cetak Laporan
            </button>
            <a
              href="/api/export/purchases"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-surface-container-lowest px-4 py-2.5 font-semibold text-on-surface shadow-level-1 transition-all hover:bg-surface-container-low"
            >
              <span className="ms text-[18px] text-secondary">table_view</span>
              Export Excel
            </a>
            <Link
              href="/pembelian/tambah"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-5 py-2.5 font-semibold text-on-primary shadow-level-2 transition-all hover:bg-[#E66700]"
            >
              <span className="ms text-[20px]">add_circle</span>
              + Tambah Pembelian
            </Link>
          </div>
        </div>

        <div className="mb-space-lg grid grid-cols-1 gap-space-md md:grid-cols-3">
          <KpiCard
            label="Total Belanja Bulan Ini"
            value={formatRupiah(currentMonthTotal)}
            sub={period}
            icon="receipt_long"
            iconBg="bg-primary-fixed/40"
            iconColor="text-primary"
          />
          <KpiCard
            label="Transaksi Bulan Ini"
            value={`${currentMonthTransactions.length} nota`}
            sub="Jumlah transaksi tercatat"
            icon="shopping_bag"
            iconBg="bg-secondary-fixed/50"
            iconColor="text-secondary"
          />
          <KpiCard
            label="Gedung Paling Aktif"
            value={activeLocation?.gedung ?? 'Belum ada transaksi'}
            sub={activeLocation ? `${activeLocation.transaksi} transaksi bulan ini` : 'Belum ada data bulan ini'}
            icon="domain"
            iconBg="bg-surface-container-high"
            iconColor="text-on-surface-variant"
          />
        </div>

        <div className="mb-space-lg">
          <SpendingByLocationChart data={locationData} period={period} />
        </div>

        <FilterPanel
          filters={filters}
          options={filterOptions}
          onChange={setFilters}
        />
        <TransactionTable
          transactions={filteredTransactions}
          loading={loading}
          onDeleted={fetchTransactions}
        />

        <div className="mt-space-lg">
          <InfoCards />
        </div>
      </div>
    </AppShell>
  )
}
