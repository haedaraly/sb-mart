'use client'

import { useState } from 'react'

export interface TransactionFilters {
  search: string
  from: string
  to: string
  location: string
  category: string
  operator: string
}

interface FilterPanelProps {
  filters: TransactionFilters
  options: {
    locations: string[]
    categories: string[]
    operators: string[]
  }
  onChange: (filters: TransactionFilters) => void
}

const selectClass =
  'w-full h-11 px-3 rounded-xl bg-surface-container-low text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container border-0'

export default function FilterPanel({ filters, options, onChange }: FilterPanelProps) {
  const [draftSearch, setDraftSearch] = useState(filters.search)

  function update<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  function reset() {
    setDraftSearch('')
    onChange({ search: '', from: '', to: '', location: '', category: '', operator: '' })
  }

  return (
    <section className="mb-space-lg rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-4 shadow-level-1 sm:p-space-lg">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="flex flex-col gap-1.5 xl:col-span-2">
          <label htmlFor="purchase-search" className="text-label-md font-semibold text-on-surface">
            Pencarian
          </label>
          <input
            id="purchase-search"
            value={draftSearch}
            onChange={(event) => {
              setDraftSearch(event.target.value)
              update('search', event.target.value)
            }}
            className={selectClass}
            placeholder="No. transaksi, barang, gedung, operator..."
            type="search"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="purchase-from" className="text-label-md font-semibold text-on-surface">Dari tanggal</label>
          <input
            id="purchase-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => update('from', event.target.value)}
            className={selectClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="purchase-to" className="text-label-md font-semibold text-on-surface">Sampai tanggal</label>
          <input
            id="purchase-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => update('to', event.target.value)}
            className={selectClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="purchase-location-filter" className="text-label-md font-semibold text-on-surface">Gedung / Lokasi</label>
          <select
            id="purchase-location-filter"
            value={filters.location}
            onChange={(event) => update('location', event.target.value)}
            className={selectClass}
          >
            <option value="">Semua Gedung</option>
            {options.locations.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="purchase-category-filter" className="text-label-md font-semibold text-on-surface">Kategori</label>
          <select
            id="purchase-category-filter"
            value={filters.category}
            onChange={(event) => update('category', event.target.value)}
            className={selectClass}
          >
            <option value="">Semua Kategori</option>
            {options.categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="purchase-operator-filter" className="text-label-md font-semibold text-on-surface">Operator</label>
          <select
            id="purchase-operator-filter"
            value={filters.operator}
            onChange={(event) => update('operator', event.target.value)}
            className={selectClass}
          >
            <option value="">Semua Operator</option>
            {options.operators.map((operator) => <option key={operator} value={operator}>{operator}</option>)}
          </select>
        </div>

        <button
          onClick={reset}
          className="h-11 rounded-xl bg-surface-container-high px-4 text-label-md font-semibold text-on-surface-variant transition hover:bg-surface-dim hover:text-on-surface"
          type="button"
        >
          Reset Filter
        </button>
      </div>
    </section>
  )
}
