'use client'

import MasterDataView from '@/components/master/MasterDataView'

interface LocationItem {
  id: number
  code: string
  name: string
  description?: string
  isActive?: boolean
}

export default function MasterLokasiPage() {
  return (
    <MasterDataView<LocationItem>
      title="Master Lokasi / Gedung"
      description="Kelola daftar lokasi, gedung unit, dan peruntukan ruangan operasional Lembaga Pendidikan Islam (LPI)."
      badgeText="Fasilitas & Sarpras"
      icon="domain"
      masterKey="locations"
      addLabel="+ Tambah Lokasi"
      searchPlaceholder="Cari berdasarkan kode gedung atau nama lokasi..."
      searchFields={(item) => `${item.code} ${item.name} ${item.description || ''}`}
      columns={[
        {
          key: 'code',
          label: 'Kode Gedung',
          className: 'w-36',
          render: (item) => (
            <span className="font-table-cell-mono text-table-cell-mono font-semibold text-primary px-2.5 py-1 rounded-lg bg-primary-fixed/40">
              {item.code}
            </span>
          ),
        },
        {
          key: 'name',
          label: 'Nama Gedung / Lokasi',
          render: (item) => (
            <span className="font-semibold text-on-surface">{item.name}</span>
          ),
        },
        {
          key: 'description',
          label: 'Keterangan / Fungsi',
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
