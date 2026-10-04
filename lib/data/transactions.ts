export type TransactionStatus = 'selesai' | 'menunggu' | 'ditolak' | 'draft'

export interface ItemRincian {
  nama: string
  nilai: string
  kategori?: string
}

export interface Transaction {
  id: string
  noTransaksi: string
  tanggal: string
  tanggalISO?: string
  description?: string
  jam: string
  lokasi: string
  lokasiColor: string
  items: ItemRincian[]
  totalNominal: number
  operatorInisial: string
  operatorNama: string
  operatorJabatan: string
  operatorBg: string
  operatorText: string
  status: TransactionStatus
}

export const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    noTransaksi: 'PB-20261004-001',
    tanggal: '04 Okt 2026',
    jam: '14:15 WIB',
    lokasi: 'Gedung Shofiyah - TU',
    lokasiColor: 'bg-primary-container',
    items: [
      { nama: 'Kertas A4 Sinar Dunia (3 rim)', nilai: 'Rp165k' },
      { nama: 'Tinta Printer Epson L3210 (2 btl)', nilai: 'Rp190k' },
      { nama: 'Map Snelhechter Folio (50 pcs)', nilai: 'Rp150k' },
      { nama: 'Binder Clip No. 107 (10 box)', nilai: 'Rp150k' },
    ],
    totalNominal: 655000,
    operatorInisial: 'SF',
    operatorNama: 'Ustadzah Sarah',
    operatorJabatan: 'Staf TU Utama',
    operatorBg: 'bg-primary-fixed',
    operatorText: 'text-on-primary-fixed',
    status: 'selesai',
  },
  {
    id: '2',
    noTransaksi: 'PB-20261004-002',
    tanggal: '04 Okt 2026',
    jam: '15:30 WIB',
    lokasi: 'Gedung Umar - Matham',
    lokasiColor: 'bg-secondary',
    items: [
      { nama: 'Minyak Goreng SunCo 2L (10 pch)', nilai: 'Rp380k' },
      { nama: 'Beras Pandan Wangi 50kg (2 sak)', nilai: 'Rp1.450k' },
      { nama: 'Bawang Merah & Putih Brebes', nilai: 'Rp220k' },
      { nama: 'Bumbu Dapur Lengkap Santri', nilai: 'Rp190k' },
    ],
    totalNominal: 2240000,
    operatorInisial: 'MH',
    operatorNama: 'Ust. Mansyur H.',
    operatorJabatan: 'Kepala Dapur',
    operatorBg: 'bg-secondary-fixed',
    operatorText: 'text-on-secondary-fixed',
    status: 'selesai',
  },
  {
    id: '3',
    noTransaksi: 'PB-20261004-003',
    tanggal: '04 Okt 2026',
    jam: '16:45 WIB',
    lokasi: 'Gedung Shofiyah - TU (Sore)',
    lokasiColor: 'bg-primary-container',
    items: [
      { nama: 'Air Mineral Galon (10 galon)', nilai: 'Rp190k' },
      { nama: 'Teh & Kopi Tamu Rapat Yayasan', nilai: 'Rp95k' },
    ],
    totalNominal: 285000,
    operatorInisial: 'SF',
    operatorNama: 'Ustadzah Sarah',
    operatorJabatan: 'Staf TU Utama',
    operatorBg: 'bg-primary-fixed',
    operatorText: 'text-on-primary-fixed',
    status: 'selesai',
  },
  {
    id: '4',
    noTransaksi: 'PB-20261004-004',
    tanggal: '04 Okt 2026',
    jam: '17:10 WIB',
    lokasi: 'Copy Center & Percetakan',
    lokasiColor: 'bg-outline',
    items: [
      { nama: 'Toner Mesin Fotokopi Canon IR', nilai: 'Rp540k' },
      { nama: 'Mika Jilid Bening (2 pak)', nilai: 'Rp70k' },
      { nama: 'Lakban Hitam Besar (6 rol)', nilai: 'Rp90k' },
    ],
    totalNominal: 700000,
    operatorInisial: 'AF',
    operatorNama: 'Ahmad Fauzi',
    operatorJabatan: 'Staf Copy Center',
    operatorBg: 'bg-surface-container-highest',
    operatorText: 'text-on-surface-variant',
    status: 'selesai',
  },
  {
    id: '5',
    noTransaksi: 'PB-20261003-012',
    tanggal: '03 Okt 2026',
    jam: '09:20 WIB',
    lokasi: 'Gedung Utsman - Asrama',
    lokasiColor: 'bg-tertiary-container',
    items: [
      { nama: 'Pembersih Lantai Karbol (4 drg)', nilai: 'Rp240k' },
      { nama: 'Sapu Ijuk & Pel Putar (8 set)', nilai: 'Rp320k' },
      { nama: 'Lampu LED Philip 14W (15 pcs)', nilai: 'Rp585k' },
      { nama: 'Kran Air & Selang 1/2 inch', nilai: 'Rp230k' },
    ],
    totalNominal: 1375000,
    operatorInisial: 'RH',
    operatorNama: 'Ust. Rahmat H.',
    operatorJabatan: 'Kepala Sarpras Asrama',
    operatorBg: 'bg-primary-fixed-dim',
    operatorText: 'text-on-primary-fixed-variant',
    status: 'selesai',
  },
  {
    id: '6',
    noTransaksi: 'PB-20261002-005',
    tanggal: '02 Okt 2026',
    jam: '11:05 WIB',
    lokasi: 'Klinik Santri Sehat',
    lokasiColor: 'bg-secondary-fixed-dim',
    items: [
      { nama: 'Paracetamol Sirup & Tab', nilai: 'Rp320k' },
      { nama: 'Kassa Steril & Plester Gulung', nilai: 'Rp185k' },
      { nama: 'Alkohol 70% & Betadine 1L', nilai: 'Rp210k' },
      { nama: 'Oralit & Vitamin C Santri', nilai: 'Rp235k' },
    ],
    totalNominal: 950000,
    operatorInisial: 'SM',
    operatorNama: 'Siti Maryam',
    operatorJabatan: 'Perawat Jaga',
    operatorBg: 'bg-secondary-container',
    operatorText: 'text-on-secondary-container',
    status: 'menunggu',
  },
  {
    id: '7',
    noTransaksi: 'PB-20261002-004',
    tanggal: '02 Okt 2026',
    jam: '08:15 WIB',
    lokasi: 'Gedung Shofiyah - TU',
    lokasiColor: 'bg-primary-container',
    items: [
      { nama: 'Baterai Mic Wireless Shure (12 pcs)', nilai: 'Rp180k' },
      { nama: 'Kabel Audio Jack 6.5mm (2 roll)', nilai: 'Rp240k' },
    ],
    totalNominal: 420000,
    operatorInisial: 'SF',
    operatorNama: 'Ustadzah Sarah',
    operatorJabatan: 'Staf TU Utama',
    operatorBg: 'bg-primary-fixed',
    operatorText: 'text-on-primary-fixed',
    status: 'selesai',
  },
  {
    id: '8',
    noTransaksi: 'PB-20261001-009',
    tanggal: '01 Okt 2026',
    jam: '13:40 WIB',
    lokasi: 'Gedung Umar - Matham',
    lokasiColor: 'bg-secondary',
    items: [
      { nama: 'Daging Sapi Segar (15 kg)', nilai: 'Rp1.950k' },
      { nama: 'Ayam Broiler Bersih (30 kg)', nilai: 'Rp1.050k' },
      { nama: 'Telur Ayam Negeri (3 peti)', nilai: 'Rp840k' },
      { nama: 'Sayuran Segar & Tempe Tahu', nilai: 'Rp420k' },
    ],
    totalNominal: 4260000,
    operatorInisial: 'MH',
    operatorNama: 'Ust. Mansyur H.',
    operatorJabatan: 'Kepala Dapur',
    operatorBg: 'bg-secondary-fixed',
    operatorText: 'text-on-secondary-fixed',
    status: 'selesai',
  },
  {
    id: '9',
    noTransaksi: 'PB-20261001-008',
    tanggal: '01 Okt 2026',
    jam: '10:15 WIB',
    lokasi: "Masjid Jami' Putra",
    lokasiColor: 'bg-outline',
    items: [
      { nama: 'Parfum Karpet Masjid Oud (5L)', nilai: 'Rp420k' },
      { nama: 'Pembersih Kaca & Wipol', nilai: 'Rp160k' },
      { nama: 'Tisu Gulung & Kotak (1 dus)', nilai: 'Rp180k' },
    ],
    totalNominal: 760000,
    operatorInisial: 'RH',
    operatorNama: 'Ust. Rahmat H.',
    operatorJabatan: 'Marbot & Sarpras',
    operatorBg: 'bg-primary-fixed-dim',
    operatorText: 'text-on-primary-fixed-variant',
    status: 'selesai',
  },
  {
    id: '10',
    noTransaksi: 'PB-20261001-002',
    tanggal: '01 Okt 2026',
    jam: '08:00 WIB',
    lokasi: 'Gedung Shofiyah - TU',
    lokasiColor: 'bg-primary-container',
    items: [
      { nama: 'Buku Induk Raport Santri (100 bk)', nilai: 'Rp1.100k' },
    ],
    totalNominal: 1100000,
    operatorInisial: 'SF',
    operatorNama: 'Ustadzah Sarah',
    operatorJabatan: 'Staf TU Utama',
    operatorBg: 'bg-primary-fixed',
    operatorText: 'text-on-primary-fixed',
    status: 'menunggu',
  },
]

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('IDR', 'Rp')
    .trim()
}
