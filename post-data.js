const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");

const scrapeAndPostData = async () => {
  //initialize express app
  const app = express();
  app.use(express.json());

  //initialize db connection
  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority";
  const dbName = "news-articles";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  //post method. Takes in an array [{url:value, collectionName:value}]
  //& a selector to scrape the urls.
  app.post("/scrape", async (req, res) => {
    const { arr, selector } = req.body;

    //iterate over each URL. Scrape it's articles
    //& store it in the respective collection
    arr.map(async (article, index) => {
      const { url, collectionName } = article;
      const collection = db.collection(collectionName);
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const articles = $(selector);
      const articlesArray = [];

      articles.each((index, element) => {
        //create and push required key:value pairs to articlesArray
        articlesArray.push({
          content: $(element).find("a").text(),
          link: $(element).find("a").attr("href"),
          image: $(element).find("figure").find("img").attr("src"),
          newsSourceImage: $(element).find(".MCAGUe").find("img").attr("src"),
        });
      });
      process.stdout.write("Hello, World");
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write("\n");

      //push articlesArray in respective collections
      await collection.insertMany(articlesArray);

      //send response back to client during the last iteration
      index == arr.length - 1 &&
        res
          .status(200)
          .send(
            "Done scraping the given URLs to the respective collections. More information about number of articles added in each collection can be found in the logs."
          );
      console.log(
        `\x1b[42mContent extracted and saved ${articlesArray.length} articles to collection ${collectionName}\x1b[0m`
      );
    });
  });

  const PORT = 3002;
  app.listen(PORT, () => {
    console.log(
      `\x1b[42m Server to scrape content "/srape" on port ${PORT} \x1b[0m`,
      `\n`
    );
  });
};

exports.scrapeAndPostData = scrapeAndPostData;
