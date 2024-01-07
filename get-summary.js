const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const { MongoClient } = require("mongodb");

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
async function scrapeWebsite(collectionName) {
  const uri =
    "mongodb+srv://rsk54:password1905@synopai.oabz6am.mongodb.net/?retryWrites=true&w=majority";
  const dbName = "news-articles";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  try {
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    let summaryString = "";
    for (let doc = 0; doc < documents.length; doc++) {
      try {
        if (documents[doc]?.destinationURL) {
          const response = await axios.get(
            documents[doc]?.destinationURL && documents[doc]?.destinationURL
          );
          const html = response.data;

          const $ = cheerio.load(html);
          let arr = [];

          $("p").each((index, element) => {
            const content = $(element).text();
            arr.push(content);
          });

          summaryString =
            (await summarizeText(arr.toString().replace(/['"]/g, ""), 50)) ||
            "N/A";
          // await collection.insertOne(summaryString);
          await collection.updateOne(
            { _id: documents[doc]._id },
            { $set: { summary: summaryString } }
          );
          console.log(
            `\x1b[43m Added summary ${doc + 1}/${
              documents.length
            } for document ${documents[doc]._id} \x1b[0m`
          );
        } else {
          console.log(
            `\x1b[31m Skipping ${doc + 1}/${
              documents.length
            } as no Destination URL was found in document ${
              documents[doc]._id
            } \x1b[0m`
          );
          continue;
        }
      } catch (error) {
        console.log(`\x1b[31m Some Axios error has occured.\x1b[0m`);
      }
    }

    // return summarizedText;
  } catch (error) {
    console.error("Error fetching and scraping the website:", error);
  }
}

app.post("/api/newsSummarizer", async (req, res) => {
  const { collectionName } = req.body;
  await scrapeWebsite(collectionName);
  res.send(`Updated Sumarries for ${collectionName}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//https://www.news.google.com/articles/CBMiXWh0dHBzOi8vd3d3LmZveG5ld3MuY29tL3VzL25hdmFqby1uYXRpb24tZGVtYW5kcy1uYXNhLXN0b3AtbGF1bmNoLWJyaW5naW5nLWh1bWFuLXJlbWFpbnMtbW9vbtIBYWh0dHBzOi8vd3d3LmZveG5ld3MuY29tL3VzL25hdmFqby1uYXRpb24tZGVtYW5kcy1uYXNhLXN0b3AtbGF1bmNoLWJyaW5naW5nLWh1bWFuLXJlbWFpbnMtbW9vbi5hbXA?hl=en-US&gl=US&ceid=US%3Aen
