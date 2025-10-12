const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class HentainiScraper {
  constructor() {
    this.baseUrl = 'https://www.hentaini.com';
  }

  /**
   * Search hentai content by keyword
   * @param {string} query
   * @returns {Promise<Array<{ title: string, url: string, thumbnail: string }>>}
   */
  async search(query) {
    const searchUrl = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);
    const results = [];

    $('.inside-post').each((_, el) => {
      const linkEl = $(el).find('h2.entry-title a');
      const title = linkEl.text().trim();
      const url = linkEl.attr('href');
      const thumbnail = $(el).find('img').attr('src');
      if (title && url) results.push({ title, url, thumbnail });
    });

    return results;
  }

  /**
   * Get details of hentai page, including image URLs
   * @param {string} pageUrl
   * @returns {Promise<{ title: string, images: string[] }>}
   */
  async getDetails(pageUrl) {
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);
    const title = $('h1.entry-title').text().trim();
    const images = [];

    $('.reading-content img').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src');
      if (src) images.push(src);
    });

    return { title, images };
  }

  /**
   * Download all images from a hentai page into the specified directory
   * @param {string} pageUrl
   * @param {string} outputDir
   * @returns {Promise<string[]>} list of saved file paths
   */
  async downloadPage(pageUrl, outputDir) {
    const { images } = await this.getDetails(pageUrl);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const savedFiles = [];
    for (const imgUrl of images) {
      const absoluteUrl = new URL(imgUrl, this.baseUrl).href;
      const filename = path.basename(new URL(absoluteUrl).pathname);
      const filepath = path.join(outputDir, filename);
      const response = await axios.get(absoluteUrl, { responseType: 'stream' });
      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      savedFiles.push(filepath);
    }

    return savedFiles;
  }
}

module.exports = new HentainiScraper();
