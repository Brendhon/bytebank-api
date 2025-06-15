import { resolvers } from '@/resolvers';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

// Load environment variables from .env file
dotenv.config();

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/bytebankdb';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar no MongoDB:', err));

const startServer = async () => {
  // Create an instance of Express
  const app = express();

  // Build the GraphQL schema using type-graphql
  const schema = await buildSchema({
    resolvers,
    emitSchemaFile: true, // Opcional: gera um arquivo schema.gql
  });

  // Create an instance of ApolloServer with schema
  const server = new ApolloServer({
    schema,
  });

  // Start the Apollo Server
  await server.start();

  app.use(
    '/graphql', // Define the GraphQL endpoint
    cors(), // Enable CORS for the endpoint
    bodyParser.json(), // Parse JSON bodies
    expressMiddleware(server, { // Pass the context to resolvers

      // You can pass additional context here, such as authentication tokens
      context: async ({ req }) => ({
        token: req.headers.authorization, // Example: pass the authorization token from headers
      }),
    })
  );

  // Set the port from environment variables or default to 4000
  const port = process.env.PORT || 4000;

  // Start the Express server
  app.listen(port, () => console.log(`🚀 Server ready at http://localhost:${port}/graphql`));
};

startServer();
