import { ApolloServer, PubSub } from 'apollo-server-express';
import { createContext } from './context';
import { schema } from './schema';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import dotenv from 'dotenv';
import { createServer } from 'http';
dotenv.config();

const pubsub = new PubSub();
const app = express();
const httpServer = createServer(app);

const server = new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
        const token = req ? req.headers.authorization : connection?.context.Authorization;

        const { prisma } = createContext();
        if (token) {
            const user = await prisma.user.findUnique({
                where: {
                    token,
                },
            });
            return { prisma, user, pubsub };
        } else {
            return { prisma, pubsub };
        }
    },
});

server.applyMiddleware({ app });
server.installSubscriptionHandlers(httpServer);

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

httpServer.listen({ port: 4000 }, () => console.log(`🚀 Server ready at: http://localhost:4000${server.graphqlPath}`));
