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

      for (let i = 0; i < 20; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);

        const updatePromises = batch.map(async (doc) => {
          const page = await browser.newPage();
          const currentUrl = `https://news.google.com/${doc.link.slice(2)}`;

          try {
            await page.goto(currentUrl, { timeout: 60000 });
            await page.waitForNavigation({
              timeout: 60000,
              waitUntil: "networkidle2",
            });
            const finalUrl = page.url();

            if (finalUrl !== currentUrl && finalUrl) {
              await collection.updateOne(
                { _id: doc._id },
                { $set: { destinationURL: finalUrl } }
              );
              await scrapeFinalUrlAndAddSummary(finalUrl, doc, collection);
            } else {
              await collection.deleteOne({ _id: doc._id });
              console.error(
                `\x1b[41m Some issue with ${doc._id} in ${collectionName}: and was deleted \x1b[0m`
              );
            }
            console.log(
              `\x1b[43m Updated URL for doc ${doc._id} and added summary in ${collectionName} \x1b[0m`
            );
          } catch (error) {
            await collection.deleteOne({ _id: doc._id });
            console.log(error);
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
