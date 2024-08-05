/**
 * Imports the MongoClient class from the 'mongodb' module.
 * This class is used to create a client instance for connecting to a MongoDB database.
 */
const { MongoClient } = require("mongodb");

// Connection URL for MongoDB database
const mongoURI =
  "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority&ssl=true";

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

module.exports = { connectToMongoDB };
