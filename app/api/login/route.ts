import bcrypt from 'bcryptjs';import {prisma} from '@/lib/db';import {makeToken,j} from '@/lib/auth';
export const dynamic='force-dynamic';
export async function POST(r:Request){const{username,password}=await r.json();const u=await prisma.user.findFirst({where:{username:String(username||''),isActive:true}});
 if(!u||!bcrypt.compareSync(password||'',u.passwordHash))return j({error:'Username atau password salah'},401);
 if(!['Super Admin','Admin','Operator'].includes(u.role))return j({error:'Role akun tidak memiliki akses'},403);
 const me={id:u.id,name:u.name,role:u.role},res=j(me);res.cookies.set('session',makeToken(me),{httpOnly:true,sameSite:'lax',path:'/',maxAge:28800});return res}
