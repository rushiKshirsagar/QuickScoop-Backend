const chai = require('chai')
const sinon = require('sinon')
const axios = require('axios')
const cheerio = require('cheerio')
const { MongoClient } = require('mongodb')
const scrapeWebsite = require('./scrape-article')
const ModelConnect = require('../constants/model-connect')

const { expect } = chai

describe('scrapeWebsite function', function () {
  let sandbox, mockCollection, mockDoc

  beforeEach(function () {
    sandbox = sinon.createSandbox()
    mockCollection = {
      updateOne: sandbox.stub().resolves(),
    }
    mockDoc = { _id: 'testId' }
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should scrape website and update document with summary', async function () {
    const mockHtml = '<html><body><p>Test content 1</p><p>Test content 2</p></body></html>'
    const mockSummary = 'Summarized content'

    sandbox.stub(axios, 'get').resolves({ data: mockHtml })
    sandbox.stub(ModelConnect).resolves(mockSummary)

    await scrapeWebsite('http://news.google.com', mockDoc, mockCollection)

    expect(axios.get.calledOnceWith('http://news.google.com')).to.be.true
    expect(ModelConnect.calledOnce).to.be.true
    expect(mockCollection.updateOne.calledOnceWith(
      { _id: 'testId' },
      { $set: { summary: mockSummary } }
    )).to.be.true
  })

  it('should handle empty response from website', async function () {
    sandbox.stub(axios, 'get').resolves({ data: '' })
    sandbox.stub(ModelConnect).resolves('N/A')

    await scrapeWebsite('http://news.google.com', mockDoc, mockCollection)

    expect(mockCollection.updateOne.calledOnceWith(
      { _id: 'testId' },
      { $set: { summary: 'N/A' } }
    )).to.be.true
  })

  it('should handle axios error', async function () {
    const consoleLogStub = sandbox.stub(console, 'log')
    sandbox.stub(axios, 'get').rejects(new Error('Network error'))

    await scrapeWebsite('http://news.google.com', mockDoc, mockCollection)

    expect(consoleLogStub.calledOnce).to.be.true
    expect(consoleLogStub.firstCall.args[0]).to.include('Some Axios error has occured')
    expect(mockCollection.updateOne.called).to.be.false
  })

  it('should handle ModelConnect returning null', async function () {
    const mockHtml = '<html><body><p>Test content</p></body></html>'
    sandbox.stub(axios, 'get').resolves({ data: mockHtml })
    sandbox.stub(ModelConnect).resolves(null)

    await scrapeWebsite('http://news.google.com', mockDoc, mockCollection)

    expect(mockCollection.updateOne.calledOnceWith(
      { _id: 'testId' },
      { $set: { summary: 'N/A' } }
    )).to.be.true
  })
})
