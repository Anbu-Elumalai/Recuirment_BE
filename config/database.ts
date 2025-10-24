import mongoose from "mongoose";
import { _config } from "./config";
import { Db } from "mongodb"; 

interface ConnectionOptions extends mongoose.ConnectOptions {
  maxPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
}

const connectionOptions: ConnectionOptions = {
  maxPoolSize: 50,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

export async function initDB(DBURL:string): Promise<Db> {
  try {
      
      const connection = await mongoose.connect( DBURL, connectionOptions);
      console.log('DB connected');
      
      setupEventListeners();
      setupGracefulShutdown();
      
      // Ensure the db instance exists
      if (!connection.connection.db) {
          throw new Error('Database instance not available after connection');
      }
      
      return connection.connection.db;
      
  } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
      throw error; // This will satisfy TypeScript's return requirement
  }
}

function setupEventListeners(): void {
  mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose default connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose default connection disconnected');
  });
}

function setupGracefulShutdown(): void {
  const shutdownHandler = async (): Promise<void> => {
    try {
      await mongoose.connection.close();
      console.log('Mongoose connection disconnected through app termination');
      process.exit(0);
    } catch (err) {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);
}
