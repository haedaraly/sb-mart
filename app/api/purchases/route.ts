import {prisma} from '@/lib/db';import {getUser,allow,j} from '@/lib/auth';import {validate,items} from '@/lib/purchase';
export async function POST(r:Request){const u=getUser();if(!allow(u,'input'))return j({error:'Tidak punya akses'},403);const b=await r.json(),e=validate(b);if(e)return j({error:e},400);
 try{const p=await prisma.$transaction(async(tx:any)=>{await tx.$executeRaw`select pg_advisory_xact_lock(42)`;const k=b.date.replace(/-/g,'');
  const last=await tx.purchase.findFirst({where:{transactionNumber:{startsWith:`PB-${k}-`}},orderBy:{transactionNumber:'desc'}});
  const no=`PB-${k}-${String((last?+last.transactionNumber.slice(-3):0)+1).padStart(3,'0')}`,l=await tx.location.findUnique({where:{code:b.loc}});if(!l)throw new Error('Gedung tidak valid');
  return tx.purchase.create({data:{transactionNumber:no,date:new Date(b.date),locationId:l.id,description:b.desc||'',createdBy:u!.id,items:{create:await items(tx,b.items)}}})});
  return j({id:p.id,no:p.transactionNumber})}catch(x:any){return j({error:x.message},400)}}
