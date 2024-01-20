const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const db = require("../constants/database-connection/database-connect");

const getData = async () => {
  const dataBase = await db();
  const app = express();
  app.use(cors());
  // const collectionName = "scraped-content";

  app.get("/getData/:collectionName", async (req, res) => {
    const { collectionName } = req.params;

    try {
      const collection = dataBase.collection(collectionName);

      const data = await collection.find({}).toArray();

      res.json(data);
    } catch (error) {
      console.error("Error fetching data from MongoDB:", error);
      res.status(500).send("Error fetching data");
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(
      `\x1b[42m Server to get data "/getData/collectionName" on port ${PORT} \x1b[0m`,
      `\n`
    );
  });
};

module.exports = getData;
