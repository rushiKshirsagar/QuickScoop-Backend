// config.js
const dataToScrape = {
  body: {
    arrayOfUrlsToBeScraped: [
      {
        url: "https://news.google.com/topics/CAAqIggKIhxDQkFTRHdvSkwyMHZNRGxqTjNjd0VnSmxiaWdBUAE?hl=en-US&gl=US&ceid=US%3Aen",
        collectionName: "US",
      },
      {
        url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
        collectionName: "Technology",
      },
      {
        url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
        collectionName: "Sports",
      },
      {
        url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen",
        collectionName: "Science",
      },
    ],
    selector: ".IBr9hb",
  },
};

module.exports = dataToScrape;
