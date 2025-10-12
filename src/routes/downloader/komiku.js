const axios = require('axios');
const cheerio = require('cheerio');

/**
 * @swagger
 * /komiku/search:
 *   get:
 *     summary: Search manga by keyword.
 *     tags:
 *       - Komiku
 *     parameters:
 *       - name: text
 *         in: query
 *         description: The search keyword for manga.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved manga search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   judul:
 *                     type: string
 *                     description: The title of the manga.
 *                   gambar:
 *                     type: string
 *                     description: The image URL of the manga.
 *                   deskripsi:
 *                     type: string
 *                     description: A brief description of the manga.
 *                   chapterAwal:
 *                     type: string
 *                     description: The first chapter of the manga.
 *                   chapterBaru:
 *                     type: string
 *                     description: The latest chapter of the manga.
 *                   url:
 *                     type: string
 *                     description: The URL of the manga's page.
 */

const komikuSearch = async (text) => {
    try {
        const { data } = await axios.get(`https://api.komiku.id/?post_type=manga&s=${encodeURIComponent(text)}`);
        const $ = cheerio.load(data);
        
        const hasil = [];
        
        $('.bge').each((index, element) => {
            const gambar = $(element).find('img').attr('src');
            const judul = $(element).find('h3').text().trim();
            const deskripsi = $(element).find('p').text().trim();
            const chapterAwal = $(element).find('.new1').first().text().trim().replace('Awal: ', '').trim();
            const chapterBaru = $(element).find('.new1').last().text().trim().replace('Terbaru: ', '').trim();
            const path = $(element).find('a').attr('href');
            const url = `https://komiku.id${path}`;
            
            hasil.push({
                judul,
                gambar,
                deskripsi,
                chapterAwal,
                chapterBaru,
                url
            });
        });
        
        return hasil;
    } catch (error) {
        console.error('Error scraping data:', error);
        return [];
    }
};

/**
 * @swagger
 * /komiku/detail:
 *   get:
 *     summary: Get manga details by URL.
 *     tags:
 *       - Komiku
 *     parameters:
 *       - name: url
 *         in: query
 *         description: The URL of the manga to get detailed information.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved manga details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: The description of the manga.
 *                 thumbnail:
 *                   type: string
 *                   description: The thumbnail of the manga.
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     originalTitle:
 *                       type: string
 *                       description: The original title of the manga.
 *                     type:
 *                       type: string
 *                       description: The type of the manga.
 *                     concept:
 *                       type: string
 *                       description: The concept or story theme.
 *                     author:
 *                       type: string
 *                       description: The author of the manga.
 *                     status:
 *                       type: string
 *                       description: The status of the manga.
 *                 genres:
 *                   type: array
 *                   items:
 *                     type: string
 *                 chapters:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         description: The title of the chapter.
 *                       url:
 *                         type: string
 *                         description: The URL of the chapter.
 */

const komikuDetail = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const result = {
            description: $('p.desc').text().trim(),
            thumbnail: $('img[itemprop="image"]').attr('src'),
            metadata: {
                originalTitle: $('table.inftable').find('tr').eq(0).find('td').eq(1).text().trim(),
                type: $('table.inftable').find('tr').eq(2).find('td').text().trim().replace('Jenis Komik', '').trim(),
                concept: $('table.inftable').find('tr').eq(3).find('td').text().trim().replace('Konsep Cerita', '').trim(),
                author: $('table.inftable').find('tr').eq(4).find('td').text().trim().replace('Pengarang', '').trim(),
                status: $('table.inftable').find('tr').eq(5).find('td').text().trim().replace('Status', '').trim(),
            },
            genres: $('ul.genre > li > a').map((i, el) => $(el).text().trim()).get(),
            chapters: $('table#Daftar_Chapter > tbody > tr > td > a').map((i, el) => ({
                title: $(el).find('span').text().trim(),
                url: `https://komiku.id${$(el).attr('href')}`
            })).get()
        };

        return result;
    } catch (error) {
        console.error('Error fetching manga details:', error);
        return {};
    }
};

/**
 * Fastify API routes
 */
module.exports = async (fastify) => {
    fastify.get('/komiku/search', async (request, reply) => {
        const { text } = request.query;
        if (!text) {
            return reply.status(400).send({ message: 'Text query is required' });
        }
        try {
            const results = await komikuSearch(text);
            return results;
        } catch (error) {
            console.error('Error searching manga:', error);
            return reply.status(500).send({ message: 'Internal Server Error' });
        }
    });

    fastify.get('/komiku/detail', async (request, reply) => {
        const { url } = request.query;
        if (!url) {
            return reply.status(400).send({ message: 'URL query is required' });
        }
        try {
            const result = await komikuDetail(url);
            return result;
        } catch (error) {
            console.error('Error fetching manga details:', error);
            return reply.status(500).send({ message: 'Internal Server Error' });
        }
    });
};
