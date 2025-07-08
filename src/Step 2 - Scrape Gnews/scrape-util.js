-cron and fs is built -in:

bash
Copy
Edit
npm install node - cron
✅ scrapeGnewsAndUpdateDB.js
js
Copy
Edit
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const cron = require("node-cron");
const db = require("../constants/database-connection/database-connect");
const dataToScrape = require("../constants/scrape-request");

const fetchWithRetry = async (url, retries = 3) => {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    return response;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Retrying ${url}... (${3 - retries + 1})`);
      return fetchWithRetry(url, retries - 1);
    } else {
      console.error(`Failed to fetch ${url}:`, err.message);
      throw err;
    }
  }
};

const scrapeGnewsAndUpdateDB = async () => {
  const { arrayOfUrlsToBeScraped } = dataToScrape.body;
  const dataBase = await db();

  const scrapingTasks = arrayOfUrlsToBeScraped.map(async (article) => {
    const { url, collectionName, selector } = article;
    const collection = dataBase.collection(collectionName);

    try {
      const response = await fetchWithRetry(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const articles = $(selector);
      const articlesArray = [];

      articles.each((index, element) => {
        const link = $(element).find("a").attr("href");

        articlesArray.push({
          content: $(element).find("a").text(),
          link,
          image: $(element).find("figure").find("img").attr("src"),
          newsSourceImage: $(element).find(".MCAGUe").find("img").attr("src"),
          timeElapsed: $(element).find(".hvbAAd").text(),
          scrapedAt: new Date(),
          sourceUrl: url,
          selectorUsed: selector
        });
      });

      // Optional: Save raw HTML snapshot
      const htmlPath = `./logs/raw-${collectionName}.html`;
      fs.writeFileSync(htmlPath, html, "utf-8");

      // Filter duplicates based on `link`
      const existingLinks = await collection.distinct("link");
      const newArticles = articlesArray.filter(
        (article) => article.link && !existingLinks.includes(article.link)
      );

      if (newArticles.length > 0) {
        await collection.insertMany(newArticles);
        console.log(
          `\x1b[42mSaved ${newArticles.length} new articles to '${collectionName}'\x1b[0m`
        );
      } else {
        console.log(`No new articles found for '${collectionName}'`);
      }
    } catch (err) {
      console.error(`Error scraping ${url}:`, err.message);
    }
  });

  await Promise.all(scrapingTasks);
  console.log("✅ All scraping tasks completed.");
};

// Schedule to run every 6 hours (customize as needed)
cron.schedule("0 */6 * * *", () => {
  console.log("\n🚀 Starting scheduled scrape...");
  scrapeGnewsAndUpdateDB();
});

// Graceful exit
process.on("SIGINT", () => {
  console.log("🛑 Gracefully shutting down.");
  process.exit();
});

module.exports = scrapeGnewsAndUpdateDB;