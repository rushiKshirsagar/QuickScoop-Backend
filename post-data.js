const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");

const scrapeAndPostData = async () => {
  const app = express();
  app.use(express.json());

  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority";
  const dbName = "news-articles";
  const client = new MongoClient(uri);

  await client.connect();

  const db = client.db(dbName);

  app.post("/scrape", async (req, res) => {
    const { arr, selector } = req.body;
    arr.map(async (article, index) => {
      const { url, collectionName } = article;
      const collection = db.collection(collectionName);
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const paragraphs = $(selector);
      const contentArray = [];

      paragraphs.each((index, element) => {
        const content = $(element).find("a").text();
        const img = $(element).find("figure").find("img").attr("src");
        const newsSourceImage = $(element)
          .find(".MCAGUe")
          .find("img")
          .attr("src");
        const link = $(element).find("a").attr("href");
        contentArray.push({
          content: content,
          link: link,
          image: img,
          newsSourceImage: newsSourceImage,
        });
      });

      await collection.insertMany(contentArray.map((content) => ({ content })));

      index == arr.length - 1 &&
        res
          .status(200)
          .send(
            "Done scraping the given URLs to the respective collections. More information about number of articles added in each collection can be found in the logs."
          );
      console.log(
        `\x1b[42mContent extracted and saved ${contentArray.length} articles to collection ${collectionName}\x1b[0m`
      );
    });
  });

  const PORT = 3002; // Specify the port number you want to use
  app.listen(PORT, () => {
    console.log(
      `\x1b[44m Server to scrape content "/srape" on port ${PORT} \x1b[0m`
    );
  });
};

exports.scrapeAndPostData = scrapeAndPostData;
