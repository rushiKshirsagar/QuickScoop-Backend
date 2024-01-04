const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const getData = async () => {
  const app = express();
  app.use(cors());
  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority";
  const dbName = "news-articles";
  const collectionName = "scraped-content";

  app.get("/getData", async (req, res) => {
    const client = new MongoClient(uri);

    try {
      await client.connect();

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      const data = await collection.find({}).toArray();

      res.json(data);
    } catch (error) {
      console.error("Error fetching data from MongoDB:", error);
      res.status(500).send("Error fetching data");
    } finally {
      await client.close();
    }
  });

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

exports.getData = getData;
