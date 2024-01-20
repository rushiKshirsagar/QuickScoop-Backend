const scrapeGnews = require("./src/Step 2 - Scrape Gnews/scrape-util");
const clearDb = require("./src/Step 1 - Clear DB/clear-db-util");
const fixUrls = require("./src/Step 3 - Setup DB/update-urls-and-add-summary");
const getData = require("./src/API/get-data");
const db = require("./src/constants/database-connection/database-connect");

const scrapeAndPostPipeline = async () => {
  try {
    await getData();
    console.log("Database up and running");
    // await clearDb();
    // console.log("Database cleaned for pipeline");
    // await scrapeGnews();
    // console.log("Database updated with scraped content");
    // await fixUrls(["US", "Sports", "Science", "Technology"]);
    // console.log("URLs and Summary updated");
  } catch (error) {
    console.log(error);
  }
};

scrapeAndPostPipeline();
