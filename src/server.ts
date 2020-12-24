import { ApolloServer } from 'apollo-server-express';
import { createContext } from './context';
import { schema } from './schema';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import dotenv from 'dotenv';
dotenv.config();

const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
        const token = req && req.headers.authorization;
        const { prisma } = createContext();
        if (token) {
            const user = await prisma.user.findUnique({
                where: {
                    token,
                },
            });
            return { prisma, user };
        } else {
            return { prisma };
        }
    },
});

const app = express();

server.applyMiddleware({ app });

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

app.listen({ port: 4000 }, () => console.log(`🚀 Server ready at: http://localhost:4000`));
