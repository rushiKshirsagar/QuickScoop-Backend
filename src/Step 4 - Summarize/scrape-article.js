const axios = require("axios");
const cheerio = require("cheerio");
const ModelConnect = require("../constants/model-connect");

async function scrapeWebsite(url, doc, collection) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const paragraphTexts = $("p")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(text => text.length > 0); // Skip empty paragraphs

    const combinedText = paragraphTexts.join(" ");
    const cleanedText = combinedText.replace(/['"]/g, "");

    const summary = await ModelConnect(cleanedText, 75);
    const summaryString = summary || "N/A";

    await collection.updateOne(
      { _id: doc._id },
      { $set: { summary: summaryString } }
    );

    console.log(`\x1b[32m Summary successfully updated for: ${url}\x1b[0m`);
  } catch (error) {
    console.error(
      `\x1b[31m Error scraping URL: ${url} | Error: ${error.message}\x1b[0m`
    );
  }
}

module.exports = scrapeWebsite;
