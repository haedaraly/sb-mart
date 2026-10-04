'use client'

import MasterDataView from '@/components/master/MasterDataView'

interface UnitItem {
  id: number
  name: string
  symbol?: string
  isActive?: boolean
}

export default function MasterSatuanPage() {
  return (
    <MasterDataView<UnitItem>
      title="Master Satuan"
      description="Kelola daftar satuan takaran barang (misal: rim, dus, pcs, liter, pak) untuk pencatatan transaksi pembelian."
      badgeText="Standar Satuan Ukur"
      icon="straighten"
      masterKey="units"
      addLabel="+ Tambah Satuan"
      searchPlaceholder="Cari nama atau simbol satuan..."
      searchFields={(item) => `${item.name} ${item.symbol || ''}`}
      columns={[
        {
          key: 'name',
          label: 'Nama Satuan',
          render: (item) => (
            <span className="font-semibold text-on-surface">{item.name}</span>
          ),
        },
        {
          key: 'symbol',
          label: 'Simbol / Singkatan',
          className: 'w-48',
          render: (item) => (
            <span className="font-table-cell-mono text-table-cell-mono font-medium px-2 py-0.5 rounded bg-surface-container-high text-on-surface">
              {item.symbol || item.name}
            </span>
          ),
        },
      ]}
    />
  )
}
