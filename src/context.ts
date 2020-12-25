import { PrismaClient, User } from '@prisma/client';
import { PubSub } from 'apollo-server-express';

const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient;
    user: User | null;
    pubsub: PubSub;
}

interface IContext {
    prisma: PrismaClient;
}

export function createContext(): IContext {
    return { prisma };
}
