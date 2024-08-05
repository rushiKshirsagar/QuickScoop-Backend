const chai = require('chai');
const sinon = require('sinon');
const { MongoClient } = require('mongodb');
const supertest = require('supertest');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const responseTime = require('response-time');
const getData = require('./get-data.js');

const { expect } = chai;

/**
 * Test suite for the GET /getData/:collectionName endpoint.
 * This test suite sets up a mock Express app and database connection,
 * and tests the behavior of the endpoint for both successful and error cases.
 */
describe('GET /getData/:collectionName', function () {
  let app, request, sandbox;

  beforeAll(async function () {
    sandbox = sinon.createSandbox();
    app = express();
    app.use(cors());
    app.use(morgan('common'));
    app.use(responseTime());
    
    // Mock database connection
    const mockDatabase = {
      collection: sandbox.stub().returns({
        find: sandbox.stub().returns({
          toArray: sandbox.stub().resolves([{ key: 'value' }]),
        }),
      }),
    };
    const mockConnectToMongoDB = sinon.stub().resolves(mockDatabase);
    sandbox.stub(require('../constants/database-connection/database-connect'), 'connectToMongoDB').callsFake(mockConnectToMongoDB);

    //sandbox.replace(require('../constants/database-connection/database-connect'), 'db', mockDb);
    
    app.get("/getData/:collectionName", async (req, res) => {
      const { collectionName } = req.params;
      try {
        const dataBase = await mockConnectToMongoDB();
        const collection = dataBase.collection(collectionName);
        const data = await collection.find({}).toArray();
        res.json(data);
      } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).send("Error fetching data");
      }
    });

    request = supertest(app);
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should fetch data from the given collection', async function () {
    const response = await request.get('/getData/testCollection');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body[0]).to.have.property('key', 'value');
  });

  it('should return 500 if there is an error fetching data', async function () {
    sandbox.restore(); // Remove any stubs/mocks
    const mockDatabase = {
      collection: sandbox.stub().returns({
        find: sandbox.stub().returns({
          toArray: sandbox.stub().rejects(new Error('Fetch error')),
        }),
      }),
    };
    const mockConnectToMongoDB = sinon.stub().resolves(mockDatabase);
    sandbox.stub(require('../constants/database-connection/database-connect'), 'connectToMongoDB').callsFake(mockConnectToMongoDB);

    //sandbox.replace(require('../constants/database-connection/database-connect'), 'db', mockDb);

    const response = await request.get('/getData/testCollection');
    expect(response.status).to.equal(500);
    expect(response.text).to.equal('Error fetching data');
  });

  afterAll(async function () {
    sandbox.restore();
  });
});
