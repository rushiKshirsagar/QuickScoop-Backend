const puppeteer = require("puppeteer");
const db = require("../constants/database-connection/database-connect");
const scrapeFinalUrlAndAddSummary = require("../Step 4 - Summarize/scrape-article");
const pLimit = require("p-limit");

const updateDestinationUrlsAndSummary = async (collectionNames) => {
  const dataBase = await db();
  const browser = await puppeteer.launch({ headless: "new", timeout: 20000 });
  const batchSize = 10;
  const concurrencyLimit = 5;
  const limit = pLimit(concurrencyLimit);

  for (const collectionName of collectionNames) {
    console.log(`\x1b[44m🔍 Processing Collection: ${collectionName} \x1b[0m`);
    let updated = 0, deleted = 0, failed = 0;

    try {
      const collection = dataBase.collection(collectionName);
      const totalDocs = await collection.countDocuments();

      for (let skip = 0; skip < Math.min(totalDocs, 50); skip += batchSize) {
        const batch = await collection.find({}).skip(skip).limit(batchSize).toArray();

        const tasks = batch.map((doc) => limit(async () => {
          const page = await browser.newPage();
          const currentUrl = `https://news.google.com/${doc.link?.slice(2)}`;

          try {
            await page.goto(currentUrl, { timeout: 10000 });
            await page.waitForNavigation({ timeout: 10000, waitUntil: "networkidle2" });

            const finalUrl = page.url();
            if (finalUrl && finalUrl !== currentUrl) {
              await collection.updateOne(
                { _id: doc._id },
                { $set: { destinationURL: finalUrl } }
              );
              await scrapeFinalUrlAndAddSummary(finalUrl, doc, collection);
              console.log(`\x1b[32m✅ Updated & summarized: ${doc._id}\x1b[0m`);
              updated++;
            } else {
              await collection.deleteOne({ _id: doc._id });
              console.warn(`\x1b[33m⚠️ Deleted due to invalid final URL: ${doc._id}\x1b[0m`);
              deleted++;
            }
          } catch (err) {
            await collection.deleteOne({ _id: doc._id });
            console.error(`\x1b[31m❌ Error on doc ${doc._id}: ${err.message} — Deleted\x1b[0m`);
            failed++;
          } finally {
            await page.close();
          }
        }));

        await Promise.all(tasks);
      }

      console.log(`\x1b[36m📊 Collection ${collectionName} Summary: Updated: ${updated}, Deleted: ${deleted}, Failed: ${failed}\x1b[0m`);
    } catch (err) {
      console.error(`\x1b[41m🔥 Error processing ${collectionName}: ${err.message} \x1b[0m`);
    }
  }

  await browser.close();
  console.log("\x1b[42m🎉 All collections processed.\x1b[0m");
};

module.exports = updateDestinationUrlsAndSummary;
