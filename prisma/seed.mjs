import {PrismaClient} from '@prisma/client';import bcrypt from 'bcryptjs';
const p=new PrismaClient();
await p.user.createMany({data:[['super','Super Admin'],['admin','Admin'],['operator','Operator'],['viewer','Viewer']].map(([u,r])=>({username:u,name:r,role:r,passwordHash:bcrypt.hashSync(u+'123',10)}))});
const L=[['SHF','Gedung Shofiyah - TU','Administrasi/TU'],['UMR','Gedung Umar - Matham','Matham'],['CPY','Copy Center','Percetakan/copy'],['ABK','Gedung Abu Bakar',''],['KHD','Gedung Khadijah',''],['FTH','Gedung Fatimah',''],['LOB','Lobby',''],['SRP-SD','Ruang Sarpras SD','Sarpras SD'],['SRP-TK','Ruang Sarpras TK','Sarpras TK']];
await p.location.createMany({data:L.map(([code,name,description])=>({code,name,description}))});
await p.category.createMany({data:['ATK','Kebersihan','Konsumsi','Maintenance','Listrik','Air','Percetakan','Perlengkapan','Lainnya'].map(name=>({name}))});
await p.unit.createMany({data:['pcs','rim','dus','box','lusin','liter','kg','meter','pak','unit'].map(name=>({name}))});
const P=[['Kertas A4','ATK','rim',55000],['Pulpen','ATK','lusin',35000],['Map Plastik','ATK','pcs',3000],['Tinta Printer','ATK','pcs',125000],['Sabun Cuci Tangan','Kebersihan','liter',28000],['Pel Lantai','Kebersihan','pcs',45000],['Air Mineral','Konsumsi','dus',22000],['Lampu LED','Maintenance','pcs',35000],['Tinta Fotokopi','Percetakan','pcs',150000],['Stop Kontak','Perlengkapan','unit',40000]],pid={};
for(const[name,c,u,price]of P)pid[name]=(await p.product.create({data:{name,defaultPrice:price,category:{connect:{name:c}},unit:{connect:{name:u}}}})).id;
const op=await p.user.findUnique({where:{username:'operator'}}),lid=Object.fromEntries((await p.location.findMany()).map(l=>[l.code,l.id]));
let r=7;const rnd=()=>(r=r*16807%2147483647)/2147483647,pur=[];
for(let i=0;i<110;i++){const it=[];for(let k=0,n=1+Math.floor(rnd()*4);k<n;k++){const x=P[Math.floor(rnd()*P.length)];it.push([x[0],x[1],x[2],1+Math.floor(rnd()*20),Math.round(x[3]*(.9+rnd()*.2)/500)*500])}
 pur.push({d:new Date(Date.UTC(2026,0,1+Math.floor(rnd()*277))).toISOString().slice(0,10),l:L[Math.floor(rnd()*9)][0],it})}
pur.sort((a,b)=>a.d<b.d?-1:1);const cnt={};
for(const x of pur){const k=x.d.replace(/-/g,'');cnt[k]=(cnt[k]||0)+1;
 await p.purchase.create({data:{transactionNumber:`PB-${k}-${String(cnt[k]).padStart(3,'0')}`,date:new Date(x.d),locationId:lid[x.l],createdBy:op.id,items:{create:x.it.map(([n,c,u,q,pr])=>({productId:pid[n],productName:n,categoryName:c,unitName:u,qty:q,unitPrice:pr,totalPrice:q*pr}))}}})}
console.log('Seed selesai.');await p.$disconnect();
