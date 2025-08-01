import "reflect-metadata"; // This need to be imported before any other imports that use decorators
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { buildSchema } from "type-graphql";
import { connectToDatabase } from "./config";
import { resolvers } from "./resolvers";

// Configure CORS based on environment
const getCorsOptions = () => {
  // In production, only allow specific domains
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  // If ALLOWED_ORIGINS is not set, it defaults to an empty array
  if (process.env.NODE_ENV === "production" && allowedOrigins.length > 0) {
    // Return CORS options for production
    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Check if the origin is allowed
        const isAllowed = !!(origin && allowedOrigins.includes(origin));

        // Log the result for debugging purposes
        console.log(`🔍 CORS Origin: ${origin} - Is allowed: ${isAllowed}`);

        // Allow requests only from allowed origins
        isAllowed ? callback(null, true) : callback(Error("Not allowed by CORS"), false);
      },
      credentials: true, // Allow cookies and authorization headers
    };
  } else return { origin: true, credentials: true };

};

/**
 * Starts the Express server with Apollo Server for GraphQL
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Create an instance of Express
    const app = express();

    // Build the GraphQL schema using type-graphql
    const schema = await buildSchema({
      // Specify the resolvers to be used in the schema
      resolvers,
      // Optional: emit the schema to a file (schema.graphql) - only in development
      // This can be useful for introspection or documentation purposes
      emitSchemaFile:
        process.env.NODE_ENV !== "production" ? "schema.graphql" : false,
    });

    // Create an instance of ApolloServer with schema
    const server = new ApolloServer({ schema });

    // Start the Apollo Server
    await server.start();

    app.use(
      "/graphql", // Define the GraphQL endpoint
      cors(getCorsOptions()), // Enable CORS with environment-specific configuration
      bodyParser.json(), // Parse JSON bodies
      expressMiddleware(server, {
        // Pass the context to resolvers

        // You can pass additional context here, such as authentication tokens
        context: async ({ req }) => ({
          token: req.headers.authorization, // Example: pass the authorization token from headers
        }),
      }),
    );

    // Set the port from environment variables or default to 4000
    const port = process.env.PORT || 4000;

    // Start the Express server
    app.listen(port, () =>
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`),
    );
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
  }
};

startServer();
