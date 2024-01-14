const puppeteer = require("puppeteer");
const db = require("../constants/database-connection/database-connect");
const scrapeFinalUrlAndAddSummary = require("../Step 4 - Summarize/scrape-article");

const updateDestinationUrlsAndSummary = async (collectionNames) => {
  const dataBase = await db();
  const browser = await puppeteer.launch({ headless: "new", timeout: 60000 });
  const batchSize = 5;

  for (const collectionName of collectionNames) {
    console.log(`\x1b[30m Processing Collection: ${collectionName} \x1b[0m`);

    try {
      const collection = dataBase.collection(collectionName);
      const documents = await collection.find({}).toArray();

      for (let i = 0; i < 10; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);

        const updatePromises = batch.map(async (doc) => {
          const page = await browser.newPage();
          const currentUrl = `https://news.google.com/${doc.link.slice(2)}`;

          try {
            await page.goto(currentUrl, { timeout: 10000 });
            await page.waitForNavigation({ timeout: 10000 });
            const finalUrl = page.url();

            await collection.updateOne(
              { _id: doc._id },
              { $set: { destinationURL: finalUrl } }
            );
            await scrapeFinalUrlAndAddSummary(finalUrl, doc, collection);
            console.log(
              `\x1b[43m Updated URL for doc ${doc._id} and added summary in ${collectionName} \x1b[0m`
            );
          } catch (error) {
            await collection.deleteOne({ _id: doc._id });
            console.error(
              `\x1b[41m Error processing doc ${doc._id} in ${collectionName}: and was deleted \x1b[0m`
            );
          } finally {
            await page.close();
          }
        });

        await Promise.all(updatePromises);
      }
    } catch (error) {
      console.error(
        `\x1b[41m Error processing collection ${collectionName}: ${error.message} \x1b[0m`
      );
    }
  }

  await browser.close();
};

module.exports = updateDestinationUrlsAndSummary;
