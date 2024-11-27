// config.js
const dataToScrape = {
  body: {
    arrayOfUrlsToBeScraped: [
      {
        url: "https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFZxYUdjU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Breaking News",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx1YlY4U0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "World",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFZxYUdjU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "India",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx6TVdZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Finance",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFZ4ZERBU0JXVnVMVWRDS0FBUAE?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Politics",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Technology",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp1ZEdvU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Sports",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Science",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNREpxYW5RU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Entertainment",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNR3QwTlRFU0JXVnVMVWRDS0FBUAE?hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Health",
        selector: ".IBr9hb",
      },
      {
        url: "https://news.google.com/search?q=fact%20check&hl=en-IN&gl=IN&ceid=IN%3Aen",
        collectionName: "Fact Check",
        selector: ".IFHyqb.DeXSAc",
      },
    ],
  },
};

module.exports = dataToScrape;
