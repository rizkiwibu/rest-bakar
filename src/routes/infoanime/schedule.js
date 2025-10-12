/**
 * @swagger
 * /infoanime/schedule:
 *   get:
 *     summary: Get weekly anime schedule from LiveChart.me (requires API key)
 *     tags:
 *       - InfoAnime
 *     parameters:
 *       - name: apikey
 *         in: query
 *         description: API key for authentication
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         description: Date in format YYYY-MM-DD (optional, default = today)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved anime schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: string
 *                     description: Day name (e.g., Monday)
 *                   anime:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           description: Anime title
 *                         time:
 *                           type: string
 *                           description: Release time
 *                         eps:
 *                           type: string
 *                           description: Episode label (e.g., Ep 2)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const validateApiKey = require("../../middlewares/validateApiKey"); // 🔒 Import middleware validasi API Key

/**
 * Scraper function to get anime schedule from LiveChart.me
 * @param {string} date - format YYYY-MM-DD (optional)
 */
const getAnimeSchedule = async (date = new Date().toISOString().split('T')[0]) => {
    try {
        const { data } = await axios.get(`https://www.livechart.me/schedule?date=${date}`);
        const $ = cheerio.load(data);
        const lc = $('.lc-timetable');
        const result = [];

        lc.find('.lc-placeholder').remove();
        lc.find('.lc-timetable-day').each((i, el) => {
            const day = $(el).find('.lc-timetable-day__heading').text().trim();
            const animeList = [];

            $(el).find('.hidden').remove();
            $(el).find('.lc-timetable-timeslot').each((j, anime) => {
                const title = $(anime).find('.lc-tt-anime-title').text().trim();
                const time = $(anime).find('.lc-time').text().trim();
                const eps = $(anime).find('.lc-tt-release-label').text().trim();
                animeList.push({ title, time, eps });
            });

            result.push({ day, anime: animeList });
        });

        return result;
    } catch (err) {
        console.error('Error fetching anime schedule:', err);
        return [];
    }
};

/**
 * Fastify route
 */
module.exports = async (fastify) => {
    fastify.get(
        '/infoanime/schedule',
        { preHandler: validateApiKey }, // ✅ Validasi API key dulu
        async (request, reply) => {
            const { date } = request.query;
            try {
                const result = await getAnimeSchedule(date);
                if (!result.length) {
                    return reply.status(404).send({ message: 'No schedule found for that date' });
                }
                return result;
            } catch (err) {
                console.error('Error in /infoanime/schedule:', err);
                return reply.status(500).send({ message: 'Internal Server Error' });
            }
        }
    );
};
