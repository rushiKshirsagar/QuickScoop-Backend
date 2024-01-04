const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const port = process.env.PORT || 3005;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
async function scrapeWebsite(newsUrl, length) {
  try {
    const response = await axios.get(newsUrl);
    const html = response.data;

    const $ = cheerio.load(html);
    let arr = [];

    $("p").each((index, element) => {
      const content = $(element).text();
      arr.push(content);
    });

    const summarizedText = await summarizeText(
      arr.toString().replace(/['"]/g, ""),
      length
    );

    return summarizedText;
  } catch (error) {
    console.error("Error fetching and scraping the website:", error);
  }
}

app.post("/api/newsSummarizer", async (req, res) => {
  const { length, url } = req.body;

  res.json({
    summary: await scrapeWebsite(url, length),
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
