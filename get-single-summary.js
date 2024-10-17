const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const morgan = require('morgan')
const responseTime = require('response-time')

const app = express();
const port = process.env.PORT || 3006;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'))
app.use(responseTime())


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
async function scrapeWebsite(url) {
  try {
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
        (await summarizeText(arr.toString().replace(/['"]/g, ""), 150)) ||
        "N/A";
      // await collection.insertOne(summaryString);
      console.log(summaryString);
      return summaryString;
    } catch (error) {
      console.log(`\x1b[31m Some Axios error has occured.\x1b[0m`);
    }
    // return summarizedText;
  } catch (error) {
    console.error("Error fetching and scraping the website:", error);
  }
}

app.post("/api/newsSummarizerSingle", async (req, res) => {
  const { url } = req.body;
  await scrapeWebsite(url);
  res.send(`Updated Sumarries for ${url}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
