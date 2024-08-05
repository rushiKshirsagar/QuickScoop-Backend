const chai = require('chai')
const sinon = require('sinon')
const axios = require('axios')
const { expect } = chai

describe('axios module', function () {
  let sandbox

  beforeEach(function () {
    sandbox = sinon.createSandbox()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should make a GET request', async function () {
    const stubAxios = sandbox.stub(axios, 'get').resolves({ data: 'test data' })
    
    const result = await axios.get('https://news.google.com/')
    
    expect(stubAxios.calledOnce).to.be.true
    expect(stubAxios.calledWith('https://news.google.com/')).to.be.true
    expect(result.data).to.equal('test data')
  })

  it('should make a POST request', async function () {
    const stubAxios = sandbox.stub(axios, 'post').resolves({ data: 'posted data' })
    
    const result = await axios.post('https://news.google.com/', { key: 'value' })
    
    expect(stubAxios.calledOnce).to.be.true
    expect(stubAxios.calledWith('https://news.google.com/', { key: 'value' })).to.be.true
    expect(result.data).to.equal('posted data')
  })

  it('should handle network errors', async function () {
    const networkError = new Error('Network Error')
    sandbox.stub(axios, 'get').rejects(networkError)
    
    try {
      await axios.get('https://news.google.com/')
      expect.fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).to.equal(networkError)
    }
  })

  it('should handle timeout errors', async function () {
    const timeoutError = new Error('timeout of 1000ms exceeded')
    timeoutError.code = 'ECONNABORTED'
    sandbox.stub(axios, 'get').rejects(timeoutError)
    
    try {
      await axios.get('https://news.google.com/')
      expect.fail('Expected an error to be thrown')
    } catch (error) {
      expect(error.code).to.equal('ECONNABORTED')
    }
  })
})
