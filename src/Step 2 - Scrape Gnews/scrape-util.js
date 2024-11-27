const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../constants/database-connection/database-connect");
const dataToScrape = require("../constants/scrape-request");

const scrapeGnewsAndUpdateDB = async () => {
  const { arrayOfUrlsToBeScraped } = dataToScrape.body;
  const dataBase = await db();

  //iterate over each URL. Scrape it's articles
  //& store it in the respective collection
  const scrapingTasks = arrayOfUrlsToBeScraped.map(async (article, index) => {
    const { url, collectionName, selector } = article;
    const collection = dataBase.collection(collectionName);
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
        timeElapsed: $(element).find(".hvbAAd").text(),
      });
    });

    //push articlesArray in respective collections
    await collection.insertMany(articlesArray);
    console.log(
      `\x1b[42mContent extracted and saved ${articlesArray.length} articles to collection ${collectionName}\x1b[0m`
    );
  });

  await Promise.all(scrapingTasks);
  console.log("All scraping tasks completed");
};

module.exports = scrapeGnewsAndUpdateDB;
