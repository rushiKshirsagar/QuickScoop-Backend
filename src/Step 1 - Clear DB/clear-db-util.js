const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../constants/database-connection/database-connect");
const collections = require("../constants/all-collections");
//clears all database collections
const clearDB = async () => {
  const dataBase = await db();

  const deletePromises = collections.map(async (collectionName) => {
    try {
      const collection = dataBase.collection(collectionName);

      // Delete all documents from the collection
      const deleteResult = await collection.deleteMany({});
      console.log(
        `\x1b[41m ${deleteResult.deletedCount} documents removed from ${collectionName}\x1b[0m`
      );
    } catch (error) {
      console.error("Error removing documents:", error);
    }
  });

  // Return a Promise that resolves when all collections are cleared
  return Promise.all(deletePromises);
};

module.exports = clearDB;
