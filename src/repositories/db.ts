import { MongoClient } from "mongodb";

const mongoUri = process.env.mongoURI || "mongodb://127.0.0.1:27017";

export const client = new MongoClient(mongoUri);

export async function runDB() {
    try {
        // Connected the client to the server
        await client.connect();
        // Establish and verify connection
        await client.db('courses').command({ ping: 1 })
        console.log('Connected successfully to mongo server');
    } catch {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}