import { ApolloServer } from 'apollo-server-express';
import { createContext } from './context';
import { schema } from './schema';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';

const server = new ApolloServer({ schema, context: createContext() });

const app = express();

server.applyMiddleware({ app });

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

app.listen({ port: 4000 }, () => console.log(`🚀 Server ready at: http://localhost:4000`));
