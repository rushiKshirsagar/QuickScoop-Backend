const axios = require("axios");
const cheerio = require("cheerio");

const summarizeText = async (str, length) => {
  const options = {
    method: "POST",
    url: "https://chatgpt-text-summarization-da0dc1f94398.herokuapp.com/ask",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "cf287f1b7fmsh11eee04c545020ap1900a5jsnc62279808b0d",
      "X-RapidAPI-Host": "chatgpt-text-summarization.p.rapidapi.com",
    },
    data: {
      message: str,
      length: length,
    },
  };
  try {
    const response = await axios.request(options);
    return response.data.summary;
  } catch (error) {
    console.error("Error:", error);
  }
};
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
      (await summarizeText(arr.toString().replace(/['"]/g, ""), 50)) || "N/A";

    await collection.updateOne(
      { _id: doc._id },
      { $set: { summary: summaryString } }
    );
  } catch (error) {
    console.log(`\x1b[31m Some Axios error has occured.\x1b[0m`);
  }
}

module.exports = scrapeWebsite;
