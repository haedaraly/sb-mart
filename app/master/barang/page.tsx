'use client'

import MasterDataView from '@/components/master/MasterDataView'
import { formatRupiah } from '@/lib/data/transactions'

interface ProductItem {
  id: number
  code?: string
  name: string
  category: string
  unit: string
  price: number
  isActive?: boolean
}

export default function MasterBarangPage() {
  return (
    <MasterDataView<ProductItem>
      title="Master Barang"
      description="Kelola katalog barang inventaris, ATK, bahan makanan, dan perlengkapan sarpras operasional."
      badgeText="Katalog Barang"
      icon="inventory_2"
      masterKey="products"
      addLabel="+ Tambah Barang"
      searchPlaceholder="Cari nama barang, kode, atau kategori..."
      searchFields={(item) => `${item.code || ''} ${item.name} ${item.category} ${item.unit}`}
      columns={[
        {
          key: 'code',
          label: 'Kode',
          className: 'w-28',
          render: (item) => (
            <span className="font-table-cell-mono text-table-cell-mono font-medium text-on-surface-variant">
              {item.code || '—'}
            </span>
          ),
        },
        {
          key: 'name',
          label: 'Nama Barang',
          render: (item) => (
            <span className="font-semibold text-on-surface">{item.name}</span>
          ),
        },
        {
          key: 'category',
          label: 'Kategori',
          className: 'w-40',
          render: (item) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium bg-surface-container-high text-on-surface">
              {item.category}
            </span>
          ),
        },
        {
          key: 'unit',
          label: 'Satuan',
          className: 'w-24 text-center',
          render: (item) => (
            <span className="text-body-sm text-on-surface-variant font-medium">
              {item.unit}
            </span>
          ),
        },
        {
          key: 'price',
          label: 'Harga Acuan',
          className: 'w-36 text-right',
          render: (item) => (
            <span className="font-table-cell-mono text-table-cell-mono font-bold text-on-surface">
              {formatRupiah(item.price)}
            </span>
          ),
        },
      ]}
    />
  )
}
