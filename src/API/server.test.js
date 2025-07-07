// server.test.js
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const getData = require("./your-server-file"); // Adjust the path to your server file
const connectToDatabase = require("../constants/database-connection/database-connect"); // Adjust the path

let mongod;
let app;
let client;

// Before all tests, set up the in-memory MongoDB and start the server
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Set the URI for the database-connect module
  connectToDatabase.setMongoUri(uri);

  // Initialize the Express app
  // We need to capture the app instance returned by getData
  // This is a bit tricky since getData listens internally.
  // We'll export the app directly from getData if possible, or
  // call getData and then use its internal app instance.
  // For simplicity in testing, let's refactor getData to return the app.
  // (See "Refactoring `getData`" section below for this)
  app = (await getData()).app; // Assuming getData returns an object with `app`

  client = await connectToDatabase(uri); // Get the client to seed data
});

// After all tests, stop the in-memory MongoDB and close the server
afterAll(async () => {
  await client.close();
  await mongod.stop();
  // Ensure the server instance is properly closed if getData returns it.
  // If getData just starts listening, you might need to find a way to close it
  // or Jest will complain about open handles.
  // For supertest, it often handles server shutdown if you pass the app instance.
});

// Before each test, clear the database
beforeEach(async () => {
  const collections = await client.listCollections().toArray();
  for (const collection of collections) {
    await client.collection(collection.name).deleteMany({});
  }
});

describe("GET /search", () => {
  it("should return all documents from all collections if no search query is provided", async () => {
    // Seed data
    await client.collection("articles").insertOne({
      content: "This is a test article.",
      summary: "Summary of test article.",
    });
    await client.collection("posts").insertOne({
      content: "Another test post.",
      summary: "Summary of test post.",
    });

    const res = await request(app).get("/search");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(Object.keys(res.body)).toContain("articles");
    expect(Object.keys(res.body)).toContain("posts");
    expect(res.body.articles).toHaveLength(1);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.articles[0].content).toBe("This is a test article.");
    expect(res.body.posts[0].content).toBe("Another test post.");
  });

  it("should return filtered documents based on the search query (case-insensitive in content/summary)", async () => {
    // Seed data
    await client.collection("articles").insertOne({
      content: "Learning about JavaScript.",
      summary: "A brief intro to JS.",
    });
    await client.collection("articles").insertOne({
      content: "Node.js is great.",
      summary: "Server-side JavaScript.",
    });
    await client.collection("posts").insertOne({
      content: "Databases with MongoDB.",
      summary: "NoSQL concepts.",
    });

    const res = await request(app).get("/search?search=javascript");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(Object.keys(res.body)).toContain("articles");
    expect(Object.keys(res.body)).not.toContain("posts"); // Should not contain posts
    expect(res.body.articles).toHaveLength(2);
    expect(res.body.articles.some((doc) => doc.content.includes("JavaScript"))).toBe(true);
    expect(res.body.articles.some((doc) => doc.summary.includes("JS"))).toBe(true);
  });

  it("should return an empty object for collections with no matching documents", async () => {
    // Seed data
    await client.collection("articles").insertOne({
      content: "Only about Python.",
      summary: "Python programming.",
    });
    await client.collection("posts").insertOne({
      content: "All about Ruby.",
      summary: "Ruby on Rails.",
    });

    const res = await request(app).get("/search?search=java");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(Object.keys(res.body)).toContain("articles");
    expect(Object.keys(res.body)).toContain("posts");
    expect(res.body.articles).toHaveLength(0);
    expect(res.body.posts).toHaveLength(0);
  });

  it("should handle an empty string search query the same as no search query", async () => {
    // Seed data
    await client.collection("books").insertOne({
      content: "The Lord of the Rings",
      summary: "Fantasy novel.",
    });

    const res = await request(app).get("/search?search=");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(Object.keys(res.body)).toContain("books");
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0].content).toBe("The Lord of the Rings");
  });

  it("should return a 500 error if there's a database connection issue", async () => {
    // Simulate a database error by trying to connect to a non-existent DB
    // This is a bit tricky to test directly without mocking `dataBase.listCollections`
    // or causing a real disconnect. For this example, we'll rely on the `connectToDatabase`
    // throwing an error if the URI is bad, but a more robust test might mock MongoDB operations.
    const originalListCollections = client.listCollections;
    client.listCollections = () => {
      throw new Error("Simulated DB error");
    };

    const res = await request(app).get("/search");

    expect(res.statusCode).toEqual(500);
    expect(res.text).toBe("Error fetching data");

    // Restore original function
    client.listCollections = originalListCollections;
  });
});
