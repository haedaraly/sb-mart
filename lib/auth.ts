import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type U = { id: number; name: string; role: string };

const ROLES = ['Super Admin', 'Admin', 'Operator'];

const sign = (s: string) =>
  crypto.createHmac('sha256', process.env.AUTH_SECRET || 'dev-secret').update(s).digest('base64url');

export const makeToken = (u: U) => {
  const p = Buffer.from(JSON.stringify(u)).toString('base64url');
  return p + '.' + sign(p);
};

export function readSessionToken(token?: string | null): U | null {
  if (!token) return null;

  const [p, s] = token.split('.');
  if (!p || s !== sign(p)) return null;

  try {
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString()) as U;
    return ROLES.includes(payload.role) ? payload : null;
  } catch {
    return null;
  }
}

export function getUser(): U | null {
  return readSessionToken(cookies().get('session')?.value);
}

const R: Record<string, string[]> = {
  input: ['Operator'],
  edit: ['Super Admin', 'Admin'],
  del: ['Super Admin', 'Admin'],
  master: ['Super Admin', 'Admin'],
  users: ['Super Admin'],
};

export const allow = (u: U | null, a: string) => !!u && Array.isArray(R[a]) && R[a].includes(u.role);

export const j = (d: any, s = 200) => NextResponse.json(d, { status: s });
