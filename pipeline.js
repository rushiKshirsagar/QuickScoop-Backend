const scrapeGnews = require("./src/Step 2 - Scrape Gnews/scrape-util");
const clearDb = require("./src/Step 1 - Clear DB/clear-db-util");
const fixUrls = require("./src/Step 3 - Setup DB/UpdateUrlsAndAddSummary");
const getData = require("./src/API/get-data");

const scrapeAndPostPipeline = async () => {
  try {
    await getData();
    await clearDb();
    console.log("Database cleaned for pipeline");
    await scrapeGnews();
    console.log("Database updated with scraped content");
    await fixUrls(["US", "Sports"]);
  } catch (error) {
    console.log(error);
  }
};

scrapeAndPostPipeline();
