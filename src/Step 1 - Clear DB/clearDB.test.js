// clearDB.test.js
const { MongoMemoryServer } = require("mongodb-memory-server");
const clearDB = require("./your-clear-db-file-path"); // Adjust path to your clearDB module
const connectToDatabase = require("../constants/database-connection/database-connect"); // Adjust path
const collections = require("../constants/all-collections"); // Adjust path

let mongod;
let dbClient; // This will hold the connected database instance

// Before all tests, start the in-memory MongoDB server
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Set the URI for the database-connect module to use the in-memory server
  connectToDatabase.setMongoUri(uri);

  // Get the database client instance
  dbClient = await connectToDatabase();

  // Suppress console.log for cleaner test output (optional)
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// After all tests, stop the in-memory MongoDB server
afterAll(async () => {
  await dbClient.client.close(); // Close the underlying MongoClient
  await mongod.stop();
  // Restore console.log (optional)
  jest.restoreAllMocks();
});

// Before each test, seed some data into the collections
beforeEach(async () => {
  // Ensure collections are empty before seeding for a fresh start
  for (const collectionName of collections) {
    await dbClient.collection(collectionName).deleteMany({});
  }

  // Seed data into each collection
  await dbClient.collection("users").insertOne({ name: "Alice", email: "alice@example.com" });
  await dbClient.collection("users").insertOne({ name: "Bob", email: "bob@example.com" });
  await dbClient.collection("products").insertOne({ name: "Laptop", price: 1200 });
  await dbClient.collection("orders").insertOne({ orderId: "ORD001", total: 150 });
});

describe("clearDB", () => {
  it("should remove all documents from all specified collections", async () => {
    // Verify that data exists before clearing
    expect(await dbClient.collection("users").countDocuments()).toBe(2);
    expect(await dbClient.collection("products").countDocuments()).toBe(1);
    expect(await dbClient.collection("orders").countDocuments()).toBe(1);

    // Call the clearDB function
    await clearDB();

    // Verify that all collections are now empty
    expect(await dbClient.collection("users").countDocuments()).toBe(0);
    expect(await dbClient.collection("products").countDocuments()).toBe(0);
    expect(await dbClient.collection("orders").countDocuments()).toBe(0);
  });

  it("should log the number of documents removed from each collection", async () => {
    // Re-seed data for this specific test as beforeEach runs before it
    await dbClient.collection("users").insertOne({ name: "Charlie" });
    await dbClient.collection("products").insertOne({ name: "Mouse" });

    // Spy on console.log to capture output
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await clearDB();

    // Check if console.log was called with the expected messages
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("2 documents removed from users"));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("1 documents removed from products"));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("1 documents removed from orders")); // From beforeEach

    consoleLogSpy.mockRestore(); // Restore original console.log
  });

  it("should handle collections that do not exist gracefully (no error thrown)", async () => {
    // Temporarily add a non-existent collection to the list for this test
    const originalCollections = [...collections];
    collections.push("nonExistentCollection");

    // Call the clearDB function
    // We expect it not to throw an error
    await expect(clearDB()).resolves.not.toThrow();

    // Clean up: remove the non-existent collection from the array
    collections.pop();
  });

  it("should handle errors during document removal", async () => {
    // Simulate an error by mocking the deleteMany function
    const mockDeleteMany = jest.fn().mockRejectedValue(new Error("Simulated delete error"));
    const originalCollection = dbClient.collection;

    // Mock collection method for a specific collection
    dbClient.collection = (name) => {
      if (name === "users") {
        return { deleteMany: mockDeleteMany };
      }
      return originalCollection(name); // Use original for other collections
    };

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await clearDB();

    expect(mockDeleteMany).toHaveBeenCalledWith({});
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error removing documents:", expect.any(Error));
    expect(consoleErrorSpy.mock.calls[0][1].message).toBe("Simulated delete error");

    consoleErrorSpy.mockRestore();
    dbClient.collection = originalCollection; // Restore original collection method
  });
});
