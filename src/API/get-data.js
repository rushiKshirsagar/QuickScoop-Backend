const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const db = require("../constants/database-connection/database-connect");
const morgan = require("morgan");
const responseTime = require("response-time");

const getData = async () => {
  const dataBase = await db();
  const app = express();
  app.use(cors());
  app.use(morgan("common"));
  app.use(responseTime());

  app.get("/search", async (req, res) => {
    const { search } = req.query; // Extract 'search' query parameter

    try {
      // Get all collection names
      const collections = await dataBase.listCollections().toArray();

      // Initialize an object to hold results
      const allResults = {};

      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        const collection = dataBase.collection(collectionName);

        let results;

        if (search && search.trim() !== "") {
          // If a non-empty search query is provided, filter by search term
          const searchFilter = {
            $or: [
              { content: { $regex: search, $options: "i" } }, // Case-insensitive search in 'title'
              { summary: { $regex: search, $options: "i" } }, // Case-insensitive search in 'content'
            ],
          };

          // Search for matching documents
          results = await collection.find(searchFilter).toArray();
        } else {
          // If search is an empty string, return all documents
          results = await collection.find({}).toArray();
        }

        // Add results to the object using the collection name as the key
        allResults[collectionName] = results;
      }

      res.json(allResults);
    } catch (error) {
      console.error("Error fetching data across collections:", error);
      res.status(500).send("Error fetching data");
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(
      `\x1b[42m Server to search data "/search?search=keyword" on port ${PORT} \x1b[0m`,
      `\n`
    );
  });
};

module.exports = getData;
