const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../constants/database-connection/database-connect");

//clears all database collections
const clearDB = async () => {
  const dataBase = await db();

  const arrOfCollections = ["Sports", "US", "Technology", "Science"];

  const deletePromises = arrOfCollections.map(async (collectionName) => {
    try {
      const collection = dataBase.collection(collectionName);

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

  // Return a Promise that resolves when all collections are cleared
  return Promise.all(deletePromises);
};

module.exports = clearDB;
