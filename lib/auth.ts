import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type U = { id: number; name: string; role: string };

const sign = (s: string) =>
  crypto.createHmac('sha256', process.env.AUTH_SECRET || 'dev-secret').update(s).digest('base64url');

export const makeToken = (u: U) => {
  const p = Buffer.from(JSON.stringify(u)).toString('base64url');
  return p + '.' + sign(p);
};

export function getUser(): U | null {
  const t = cookies().get('session')?.value;
  if (!t) {
    if (process.env.NODE_ENV === 'development') {
      return { id: 1, name: 'Super Admin', role: 'Super Admin' };
    }
    return null;
  }
  const [p, s] = t.split('.');
  if (!p || s !== sign(p)) return null;
  try {
    return JSON.parse(Buffer.from(p, 'base64url').toString());
  } catch {
    return null;
  }
}

const R: Record<string, string[]> = {
  input: ['Super Admin', 'Admin', 'Operator'],
  edit: ['Super Admin', 'Admin', 'Operator'],
  del: ['Super Admin', 'Admin'],
  master: ['Super Admin', 'Admin'],
  users: ['Super Admin'],
};

export const allow = (u: U | null, a: string) => !!u && Array.isArray(R[a]) && R[a].includes(u.role);

export const j = (d: any, s = 200) => NextResponse.json(d, { status: s });
