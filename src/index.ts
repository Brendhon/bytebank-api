import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { resolvers } from './resolvers';
import { typeDefs } from './schema';

// Load environment variables from .env file
dotenv.config();

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/bytebankdb';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar no MongoDB:', err);
  });

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

  // Set the port from environment variables or default to 4000
  const port = process.env.PORT || 4000;

  // Start the Express server
  app.listen(port, () => console.log(`🚀 Server ready at http://localhost:${port}/graphql`));
};

startServer();
