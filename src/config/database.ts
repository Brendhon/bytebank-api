import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/bytebankdb";

// Variable to hold the MongoDB connection
let mongoConnection: typeof mongoose | null = null;

export const connectToDatabase = async (): Promise<void> => {
  try {
    // If there's an existing connection, reuse it
    if (mongoConnection) {
      console.log("📡 Reusando conexão existente com MongoDB");
      return;
    }

    // Log the connection attempt
    console.log("🔗 Conectando ao MongoDB...", MONGO_URI);

    // Connect to MongoDB using Mongoose
    mongoConnection = await mongoose.connect(MONGO_URI, {
      dbName: "bytebank",
      bufferCommands: false,
    });

    // Log successful connection
    console.log("✅ MongoDB conectado com sucesso!");

    // Lidando com o encerramento da aplicação
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB desconectado devido ao encerramento da aplicação");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ Erro ao conectar no MongoDB:", err);
    mongoConnection = null;
    throw err;
  }
};
