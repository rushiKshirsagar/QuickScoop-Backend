const { MongoClient } = require("mongodb");

// Connection URL for MongoDB database
const mongoURI = process.env.MONGO_CONNECTION_URL

// Function to connect to the MongoDB database
async function connectToMongoDB() {
  try {
    // Create a MongoClient instance and connect to the database
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("news-articles");

    // Once connected, return the MongoDB client instance
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

module.exports = connectToMongoDB;
