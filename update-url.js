const express = require("express");
const puppeteer = require("puppeteer");
const { MongoClient } = require("mongodb");

const updateDestinationUrls = async () => {
  //initialize express app
  const app = express();
  app.use(express.json());
  //establish db connection
  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority"; // Replace with your MongoDB connection string
  const dbName = "news-articles"; // Database name

  async function updateUrls(collectionName) {
    console.log(`\x1b[30m CollectionName Decrypted Total \x1b[0m`);
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db(dbName);

      //launch headless browser
      const browser = await puppeteer.launch({
        headless: "new",
        timeout: 60000,
      });
      //get all the documents from given collection
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();

      //iterate over all documents in current collectionName
      for (let doc = 0; doc < documents.length; doc++) {
        //get link from each document.
        //this link starts with ./xyz which needs to be prepended with
        //https://news.google.com/
        const currentUrl = `https://news.google.com/${documents[doc].link.slice(
          2,
          documents[doc].link.length
        )}`;

        try {
          const page = await browser.newPage();
          await page.goto(currentUrl, { timeout: 10000 });

          //need to wait for navigation as news.google.com url redirects to actual news source.
          await page.waitForNavigation();
          const finalUrl = page.url();
          // Update the document in the collection with the final URL
          await collection.updateOne(
            { _id: documents[doc]._id },
            { $set: { destinationURL: finalUrl } }
          );
          console.log(
            `\x1b[43m ${collectionName} ${doc + 1}/${documents.length} \x1b[0m`
          );

          await page.close();
          doc === documents.length - 1 && (await browser.close());
          doc === documents.length - 1 && (await client.close());
        } catch (error) {
          console.error(
            `\x1b[41m Skipping ${doc + 1}/${documents.length} ${
              documents[doc]._id
            } - Timeout \x1b[0m`
          );
        }
      }

      //close browser & db connection on last collectionName iteration
    } catch (error) {
      console.error("Error updating URLs:", error);
    }
  }

  app.post("/update-urls", async (req, res) => {
    const { collectionName } = req.body;
    try {
      await updateUrls(collectionName);
      res.send("URLs updated successfully");
    } catch (error) {
      console.error("Error updating URLs:", error);
      res.status(500).send("Error updating URLs");
    }
  });

  const PORT = 3003; // Specify the port number you want to use
  app.listen(PORT, () => {
    console.log(
      `\x1b[42m Server to update urls "/update-urls" on port ${PORT} \x1b[0m`,
      `\n`
    );
  });
};

exports.updateDestinationUrls = updateDestinationUrls;
