const { MongoClient } = require("mongodb");

const deleteAllRecords = async () => {
  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority"; // Replace with your MongoDB connection string
  const dbName = "news-articles"; // Database name
  const collectionName = "scraped-content"; // Collection name

  async function removeAllDocuments() {
    const client = new MongoClient(uri);

    try {
      await client.connect();

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Delete all documents from the collection
      const deleteResult = await collection.deleteMany({});

      console.log(`${deleteResult.deletedCount} documents removed`);
    } catch (error) {
      console.error("Error removing documents:", error);
    } finally {
      await client.close();
    }
  }

  // Call the function to remove all documents
  removeAllDocuments();
};

exports.deleteAllRecords = deleteAllRecords;
