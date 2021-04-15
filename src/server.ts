import { ApolloServer, PubSub } from 'apollo-server-express';
import { createContext } from './context';
import { schema } from './schema';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();

const pubsub = new PubSub();
const app = express();
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

const httpServer = createServer(app);

interface IToken {
  id: number;
}

const server = new ApolloServer({
  schema,
  context: async ({ req, res }) => {
    const token = req.cookies['jwt'] || '';

    const { prisma } = createContext();
    if (token === 'loggedOut') {
      return { prisma, pubsub, res };
    }

    const secret = process.env.JWT_SECRET;
    if (token && secret) {
      const decoded = jwt.verify(token, secret);
      const user = await prisma.user.findUnique({
        where: {
          id: (decoded as IToken).id,
        },
      });
      return { prisma, user, pubsub, res };
    } else {
      return { prisma, pubsub, res };
    }
  },
});

server.applyMiddleware({ app, cors: false });
server.installSubscriptionHandlers(httpServer);

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

httpServer.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at: http://localhost:4000${server.graphqlPath}`)
);
