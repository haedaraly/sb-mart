import ExcelJS from 'exceljs';import {prisma} from '@/lib/db';import {getUser,j} from '@/lib/auth';
export const dynamic='force-dynamic';
export async function GET(r:Request){const u=getUser();if(!u)return j({error:'Belum login'},401);if(!['Super Admin','Admin'].includes(u.role))return j({error:'Tidak punya akses'},403);const s=new URL(r.url).searchParams,a=s.get('a'),b=s.get('b'),g=s.get('g'),c=s.get('c');
 const ps=await prisma.purchase.findMany({where:{...(a||b?{date:{...(a?{gte:new Date(a)}:{}),...(b?{lte:new Date(b)}:{})}}:{}),...(g?{location:{code:g}}:{})},include:{items:true,location:true,creator:true},orderBy:[{date:'asc'},{id:'asc'}]});
 const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Pembelian'),rk=wb.addWorksheet('Rekap Gedung'),rp='"Rp"#,##0';
 ws.columns=[['no','No. Transaksi',20],['d','Tanggal',16],['g','Gedung',26],['o','Operator',14],['n','Barang',26],['c','Kategori',14],['q','Qty',8],['u','Satuan',10],['p','Harga',14],['t','Total',16]].map(([key,header,width]:any)=>({key,header,width}));
 const rec:any={};let all=0;
 for(const p of ps)for(const i of p.items){if(c&&i.categoryName!=c)continue;const t=Number(i.totalPrice);all+=t;rec[p.location.name]=(rec[p.location.name]||0)+t;
  ws.addRow({no:p.transactionNumber,d:p.date,g:p.location.name,o:p.creator.name,n:i.productName,c:i.categoryName,q:Number(i.qty),u:i.unitName,p:Number(i.unitPrice),t})}
 ws.addRow({n:'TOTAL',t:all}).font={bold:true};ws.getRow(1).font={bold:true};ws.getColumn('p').numFmt=rp;ws.getColumn('t').numFmt=rp;ws.getColumn('d').numFmt='dd mmmm yyyy';
 rk.columns=[{key:'g',header:'Gedung',width:28},{key:'t',header:'Total',width:18}];rk.getRow(1).font={bold:true};Object.entries(rec).forEach(([g,t])=>rk.addRow({g,t}));rk.getColumn('t').numFmt=rp;
 const buf=Buffer.from(await wb.xlsx.writeBuffer());
 return new Response(buf,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="pembelian.xlsx"'}})}
