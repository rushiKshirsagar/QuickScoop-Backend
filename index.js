const { getData } = require("./get-data");
const { deleteAllRecords } = require("./delete-data");
const { scrapeAndPostData } = require("./post-data");
const { updateDestinationUrls } = require("./update-url");

const dataRefreshPipeline = async () => {
  await deleteAllRecords();
  await scrapeAndPostData();
  await updateDestinationUrls();
  await getData();
};

dataRefreshPipeline();
