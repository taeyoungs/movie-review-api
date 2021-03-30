import { ApolloServer, PubSub } from 'apollo-server-express';
import { createContext } from './context';
import { schema } from './schema';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
dotenv.config();

const pubsub = new PubSub();
const app = express();
const httpServer = createServer(app);

interface IToken {
  id: number;
}

const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    const token = req
      ? req.headers.authorization
      : connection?.context.Authorization;

    const secret = process.env.JWT_SECRET;
    const { prisma } = createContext();
    if (token && secret) {
      const decoded = jwt.verify(token.split(' ')[1], secret);
      const user = await prisma.user.findUnique({
        where: {
          id: (decoded as IToken).id,
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

httpServer.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at: http://localhost:4000${server.graphqlPath}`)
);
