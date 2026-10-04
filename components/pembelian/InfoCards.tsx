const infoItems = [
  {
    icon: 'verified_user',
    color: 'text-primary',
    title: 'Validitas Bukti Pengeluaran',
    body: 'Seluruh nota transaksi di atas Rp500.000 wajib dilampiri cap basah vendor & paraf Kepala Unit bersangkutan.',
  },
  {
    icon: 'account_balance_wallet',
    color: 'text-secondary',
    title: 'Sinkronisasi Kas Harian',
    body: 'Tutup buku kas kecil dilakukan setiap hari kerja pukul 17:00 WIB oleh tim Bendahara Yayasan.',
  },
  {
    icon: 'help_center',
    color: 'text-tertiary',
    title: 'Pusat Bantuan Administrasi',
    body: 'Hubungi Unit IT LPI jika terdapat ketidaksesuaian kode pos anggaran atau gangguan cetak faktur.',
  },
]

export default function InfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      {infoItems.map((item) => (
        <div
          key={item.title}
          className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm hover:shadow-level-1 transition-shadow border border-transparent hover:border-[#E2E8F0]"
        >
          <span className={`ms text-[22px] mt-0.5 flex-shrink-0 ${item.color}`}>
            {item.icon}
          </span>
          <div className="flex flex-col">
            <span className="text-headline-sm font-headline-sm text-on-surface">
              {item.title}
            </span>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
              {item.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
