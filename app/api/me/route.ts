import {getUser,j} from '@/lib/auth';
export const dynamic='force-dynamic';
export async function GET(){const u=getUser();return u?j(u):j({error:'Belum login'},401)}
