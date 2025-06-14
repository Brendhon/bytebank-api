import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { resolvers } from './resolvers';
import { typeDefs } from './schema';

const startServer = async () => {
  // Create an instance of Express
  const app = express();

  // Create an instance of ApolloServer with type definitions and resolvers
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start the Apollo Server
  await server.start();

  app.use(
    '/graphql', // Path to your GraphQL endpoint
    cors(), // Enable CORS for all origins
    bodyParser.json(), // Parse JSON bodies
    expressMiddleware(server, { // Middleware to handle GraphQL requests
      // Optional: You can pass a context function to provide additional data to resolvers
      // For example, you can pass the request headers or user information
      // Here we pass the authorization token from headers
      context: async ({ req }) => ({
        token: req.headers.authorization,
      }),
    })
  );

  // Start the Express server
  app.listen(3000, () => console.log('🚀 Server ready at http://localhost:3000/graphql'));
};

startServer();
