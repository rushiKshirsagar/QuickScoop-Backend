const axios = require("axios");
const cheerio = require("cheerio");
const ModelConnect = require("../constants/model-connect");

async function scrapeWebsite(url, doc, collection) {
  let summaryString = "";
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    let arr = [];

    $("p").each((index, element) => {
      const content = $(element).text();
      arr.push(content);
    });

    summaryString =
      (await ModelConnect(arr.toString().replace(/['"]/g, ""), 50)) || "N/A";

    await collection.updateOne(
      { _id: doc._id },
      { $set: { summary: summaryString } }
    );
  } catch (error) {
    console.log(`\x1b[31m Some Axios error has occured.\x1b[0m`, error);
  }
}

module.exports = scrapeWebsite;
