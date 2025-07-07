const axios = require("axios");
const cheerio = require("cheerio");
const scrapeGnewsAndUpdateDB = require("../scraper/gnewsScraper");

// Mock dependencies
jest.mock("axios");
jest.mock("../constants/database-connection/database-connect");
jest.mock("../constants/scrape-request");

const mockInsertMany = jest.fn();

const mockHtml = `
  <div class="article">
    <a href="https://example.com/news1">Breaking News</a>
    <figure><img src="https://example.com/image1.jpg" /></figure>
    <div class="MCAGUe"><img src="https://example.com/source-logo.png" /></div>
    <div class="hvbAAd">5 minutes ago</div>
  </div>
`;

describe("scrapeGnewsAndUpdateDB", () => {
  beforeEach(() => {
    // Mock dataToScrape
    const { load } = cheerio;
    require("../constants/scrape-request").body = {
      arrayOfUrlsToBeScraped: [
        {
          url: "https://example.com",
          collectionName: "testCollection",
          selector: ".article"
        }
      ]
    };

    // Mock axios
    axios.get.mockResolvedValue({ data: mockHtml });

    // Mock DB
    require("../constants/database-connection/database-connect").mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        insertMany: mockInsertMany
      })
    });

    // Reset mocks
    mockInsertMany.mockClear();
  });

  it("should scrape articles and insert into database", async () => {
    await scrapeGnewsAndUpdateDB();

    expect(axios.get).toHaveBeenCalledWith("https://example.com");
    expect(mockInsertMany).toHaveBeenCalledWith([
      {
        content: "Breaking News",
        link: "https://example.com/news1",
        image: "https://example.com/image1.jpg",
        newsSourceImage: "https://example.com/source-logo.png",
        timeElapsed: "5 minutes ago",
      },
    ]);
  });
});
