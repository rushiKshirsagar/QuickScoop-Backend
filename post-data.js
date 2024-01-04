const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");

const scrapeAndPostData = async () => {
  const app = express();
  app.use(express.json());

  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority"; // Replace with your MongoDB connection string
  const dbName = "news-articles"; // Database name
  // Collection name

  app.post("/scrape", async (req, res) => {
    const { url } = req.body;
    const collectionName = "scraped-content";
    try {
      const response = await axios.get(url);
      const html = response.data;

      const $ = cheerio.load(html);
      const paragraphs = $("article"); // Select all <p> tags from the HTML

      const contentArray = []; // Array to store extracted content

      paragraphs.each((index, element) => {
        const content = $(element).find("a").text();
        const img = $(element).find("figure").find("img").attr("src");
        const newsSourceImage = $(element)
          .find(".MCAGUe")
          .find("img")
          .attr("src");
        contentArray.push({
          content: content,
          link: $(element).find("a").attr("href"),
          image: img,
          newsSourceImage: newsSourceImage,
        });
      });

      // Connect to MongoDB
      const client = new MongoClient(uri);

      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Insert extracted content into MongoDB collection
      await collection.insertMany(contentArray.map((content) => ({ content })));

      await client.close();

      res.status(200).send("Content extracted and saved to MongoDB");
    } catch (error) {
      console.error("Error scraping and saving content:", error);
      res.status(500).send("Error scraping content");
    }
  });

  const PORT = 3002; // Specify the port number you want to use
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

exports.scrapeAndPostData = scrapeAndPostData;
