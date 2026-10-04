import {prisma} from '@/lib/db';import {getUser,allow,j} from '@/lib/auth';import {validate,items} from '@/lib/purchase';

export async function GET() {
  const user = getUser();
  if (!user) return j({ error: 'Belum login' }, 401);
  if (!['Super Admin', 'Admin'].includes(user.role)) return j({ error: 'Tidak punya akses' }, 403);

  try {
    const purchases = await prisma.purchase.findMany({
      include: { location: true, creator: true, items: true },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    return j(purchases.map((purchase) => {
      const initials = purchase.creator.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
      const date = purchase.date.toISOString().slice(0, 10);

      return {
        id: String(purchase.id),
        noTransaksi: purchase.transactionNumber,
        tanggal: new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(purchase.date),
        jam: new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        }).format(purchase.createdAt),
        tanggalISO: date,
        lokasi: purchase.location.name,
        lokasiColor: 'bg-primary-container',
        items: purchase.items.map((item) => ({
          nama: item.productName,
          nilai: `${item.categoryName} · ${Number(item.qty)} ${item.unitName}`,
          kategori: item.categoryName,
        })),
        totalNominal: purchase.items.reduce((total, item) => total + Number(item.totalPrice), 0),
        operatorInisial: initials,
        operatorNama: purchase.creator.name,
        operatorJabatan: '',
        operatorBg: 'bg-primary-fixed',
        operatorText: 'text-on-primary-fixed',
        status: 'selesai',
        description: purchase.description,
      };
    }));
  } catch (error) {
    console.error('Gagal memuat transaksi pembelian:', error);
    return j({ error: 'Gagal memuat transaksi pembelian' }, 500);
  }
}

export async function POST(r:Request){const u=getUser();if(!allow(u,'input'))return j({error:'Tidak punya akses'},403);const b=await r.json(),e=validate(b);if(e)return j({error:e},400);
 try{const p=await prisma.$transaction(async(tx:any)=>{await tx.$executeRaw`select pg_advisory_xact_lock(42)`;const k=b.date.replace(/-/g,'');
  const last=await tx.purchase.findFirst({where:{transactionNumber:{startsWith:`PB-${k}-`}},orderBy:{transactionNumber:'desc'}});
  const no=`PB-${k}-${String((last?+last.transactionNumber.slice(-3):0)+1).padStart(3,'0')}`,l=await tx.location.findUnique({where:{code:b.loc}});if(!l)throw new Error('Gedung tidak valid');
  return tx.purchase.create({data:{transactionNumber:no,date:new Date(b.date),locationId:l.id,description:b.desc||'',createdBy:u!.id,items:{create:await items(tx,b.items)}}})});
  return j({id:p.id,no:p.transactionNumber})}catch(x:any){return j({error:x.message},400)}}
