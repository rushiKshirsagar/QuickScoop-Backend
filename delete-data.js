const { MongoClient } = require("mongodb");

const deleteAllRecords = async () => {
  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority"; // Replace with your MongoDB connection string
  const dbName = "news-articles"; // Database name
  const arrOfCollections = ["Sports", "US", "Technology", "Science"];

  const client = new MongoClient(uri);

  arrOfCollections.map(async (collectionName) => {
    try {
      await client.connect();

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Delete all documents from the collection
      const deleteResult = await collection.deleteMany({});
      console.log(
        `\x1b[41m ${deleteResult.deletedCount} documents removed from ${collectionName}\x1b[0m`,
        `\n`
      );
    } catch (error) {
      console.error("Error removing documents:", error);
    }
  });
};

exports.deleteAllRecords = deleteAllRecords;
