import {j} from '@/lib/auth';
export async function POST(){const r=j({ok:1});r.cookies.delete('session');return r}
