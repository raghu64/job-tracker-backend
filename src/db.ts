import { MongoClient, ServerApiVersion, Db } from "mongodb";
import config from "./config/index.js";
import dotenv from "dotenv";

const client = new MongoClient(config.mongoDbUrl as string, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let database: Db | null = null;

export async function connectDB(): Promise<Db> {
    if (!database) {
        await client.connect();
        database = await client.db("job-tracker");
        console.log("Connected to MongoDB");
    }
    return database;
}

export function getDb(): Db {
    if (!database) throw new Error("Databse not initialized. call connectDB first.")
    return database
}


