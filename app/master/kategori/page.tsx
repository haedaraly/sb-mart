'use client'

import MasterDataView from '@/components/master/MasterDataView'

interface CategoryItem {
  id: number
  name: string
  description?: string
  isActive?: boolean
}

export default function MasterKategoriPage() {
  return (
    <MasterDataView<CategoryItem>
      title="Master Kategori"
      description="Kelola pengelompokan klasifikasi barang untuk kemudahan penganggaran dan pencatatan belanja."
      badgeText="Klasifikasi Belanja"
      icon="category"
      masterKey="categories"
      addLabel="+ Tambah Kategori"
      searchPlaceholder="Cari nama kategori belanja..."
      searchFields={(item) => `${item.name} ${item.description || ''}`}
      columns={[
        {
          key: 'name',
          label: 'Nama Kategori',
          className: 'w-64',
          render: (item) => (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="font-semibold text-on-surface">{item.name}</span>
            </div>
          ),
        },
        {
          key: 'description',
          label: 'Keterangan',
          render: (item) => (
            <span className="text-body-sm text-on-surface-variant">
              {item.description || '—'}
            </span>
          ),
        },
      ]}
    />
  )
}
