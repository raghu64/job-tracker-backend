
import { MongoClient, ServerApiVersion } from 'mongodb';
import config from "./config/index.js"
// import dotenv from "dotenv";

// dotenv.config({"path": "../.env"});

const client = new MongoClient(config.mongoDbUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("job-tracker").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
