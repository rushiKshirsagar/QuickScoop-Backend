const express = require("express");
const puppeteer = require("puppeteer");
const { MongoClient } = require("mongodb");

const updateDestinationUrls = async () => {
  const app = express();
  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority"; // Replace with your MongoDB connection string
  const dbName = "news-articles"; // Database name
  const collectionName = "scraped-content"; // Collection name

  async function updateUrls() {
    const client = new MongoClient(uri);

    try {
      await client.connect();

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      const documents = await collection.find({}).toArray();

      const browser = await puppeteer.launch({
        headless: "new",
        timeout: 60000,
      });

      for (const doc of documents) {
        const currentUrl = `https://news.google.com/${doc.content.link.slice(
          2,
          doc.content.link.length
        )}`;
        console.log(currentUrl);

        try {
          const page = await browser.newPage();
          await page.goto(currentUrl, { timeout: 10000 });
          await page.waitForNavigation();
          const finalUrl = page.url();
          console.log(finalUrl);
          // Update the document in the collection with the final URL
          await collection.updateOne(
            { _id: doc._id },
            { $set: { "content.destinationURL": finalUrl } }
          );

          console.log(`Updated URL for document with _id: ${doc._id}`);
          await page.close();
        } catch (error) {
          console.error(
            `Error updating URL for document with _id: ${doc._id}`,
            error
          );
        }
      }

      await browser.close();
    } catch (error) {
      console.error("Error updating URLs:", error);
    } finally {
      await client.close();
    }
  }

  app.get("/update-urls", async (req, res) => {
    try {
      await updateUrls();
      res.send("URLs updated successfully");
    } catch (error) {
      console.error("Error updating URLs:", error);
      res.status(500).send("Error updating URLs");
    }
  });

  const PORT = 3003; // Specify the port number you want to use
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

exports.updateDestinationUrls = updateDestinationUrls;
