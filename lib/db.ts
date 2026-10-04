import {PrismaClient} from '@prisma/client';
const g=globalThis as any;
export const prisma:PrismaClient=g.__prisma||(g.__prisma=new PrismaClient());
