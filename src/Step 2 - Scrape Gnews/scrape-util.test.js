const chai = require('chai')
const sinon = require('sinon')
const cheerio = require('cheerio')
const { scrapeGnews } = require('./scrape-util')

const { expect } = chai

describe('scrapeGnews function', function () {
  let sandbox

  beforeEach(function () {
    sandbox = sinon.createSandbox()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should correctly parse articles from HTML', function () {
    const mockHtml = `
      <div class="article">
        <a href="https://news.google.com/article1">Article 1 Title</a>
        <figure><img src="image1.jpg" /></figure>
        <div class="MCAGUe"><img src="source1.jpg" /></div>
        <div class="hvbAAd">2 hours ago</div>
      </div>
      <div class="article">
        <a href="https://news.google.com/article2">Article 2 Title</a>
        <figure><img src="image2.jpg" /></figure>
        <div class="MCAGUe"><img src="source2.jpg" /></div>
        <div class="hvbAAd">1 day ago</div>
      </div>
    `

    const $ = cheerio.load(mockHtml)
    const articles = $('.article')

    const articlesArray = []
    articles.each((index, element) => {
      articlesArray.push({
        content: $(element).find("a").text(),
        link: $(element).find("a").attr("href"),
        image: $(element).find("figure").find("img").attr("src"),
        newsSourceImage: $(element).find(".MCAGUe").find("img").attr("src"),
        timeElapsed: $(element).find(".hvbAAd").text(),
      })
    })

    expect(articlesArray).to.have.lengthOf(2)
    expect(articlesArray[0]).to.deep.equal({
      content: 'Article 1 Title',
      link: 'https://news.google.com/article1',
      image: 'image1.jpg',
      newsSourceImage: 'source1.jpg',
      timeElapsed: '2 hours ago'
    })
    expect(articlesArray[1]).to.deep.equal({
      content: 'Article 2 Title',
      link: 'https://news.google.com/article2',
      image: 'image2.jpg',
      newsSourceImage: 'source2.jpg',
      timeElapsed: '1 day ago'
    })
  })

  it('should handle missing data gracefully', function () {
    const mockHtml = `
      <div class="article">
        <a href="https://news.google.com/article1">Article 1 Title</a>
      </div>
    `

    const $ = cheerio.load(mockHtml)
    const articles = $('.article')

    const articlesArray = []
    articles.each((index, element) => {
      articlesArray.push({
        content: $(element).find("a").text(),
        link: $(element).find("a").attr("href"),
        image: $(element).find("figure").find("img").attr("src"),
        newsSourceImage: $(element).find(".MCAGUe").find("img").attr("src"),
        timeElapsed: $(element).find(".hvbAAd").text(),
      })
    })

    expect(articlesArray).to.have.lengthOf(1)
    expect(articlesArray[0]).to.deep.equal({
      content: 'Article 1 Title',
      link: 'https://news.google.com/article1',
      image: undefined,
      newsSourceImage: undefined,
      timeElapsed: ''
    })
  })

  it('should handle empty HTML', function () {
    const mockHtml = ''

    const $ = cheerio.load(mockHtml)
    const articles = $('.article')

    const articlesArray = []
    articles.each((index, element) => {
      articlesArray.push({
        content: $(element).find("a").text(),
        link: $(element).find("a").attr("href"),
        image: $(element).find("figure").find("img").attr("src"),
        newsSourceImage: $(element).find(".MCAGUe").find("img").attr("src"),
        timeElapsed: $(element).find(".hvbAAd").text(),
      })
    })

    expect(articlesArray).to.have.lengthOf(0)
  })
})
