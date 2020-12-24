import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient;
    user: User | null;
}

interface IContext {
    prisma: PrismaClient;
}

export function createContext(): IContext {
    return { prisma };
}
