const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * /aio:
 *   get:
 *     summary: Download videos using AnyDownloader
 *     tags:
 *       - AIO Downloader
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL of the video to download
 *       - in: query
 *         name: apikey
 *         required: true
 *         schema:
 *           type: string
 *         description: API key for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved video download links
 *       403:
 *         description: API key is invalid or limit exceeded
 *       400:
 *         description: Invalid request (missing URL)
 *       500:
 *         description: Internal server error
 */

const BaseAPI = "https://anydownloader.com/wp-json/aio-dl/video-data/";

async function kinchanAIODL(url) {
    try {
        const response = await axios.post(BaseAPI, new URLSearchParams({ url: url }), {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://anydownloader.com/en/",
                "Origin": "https://anydownloader.com"
            }
        });

        if (response.data && response.data.medias) {
            return response.data.medias.map(media => ({
                quality: media.quality || "Unknown",
                url: media.url
            }));
        }

        return null;
    } catch {
        return null;
    }
}

module.exports = async (fastify) => {
    fastify.get("/aio", { preHandler: validateApiKey }, async (request, reply) => {
        const { url } = request.query;

        if (!url) {
            return reply.status(400).send({ status: false, message: "URL is required" });
        }

        const result = await kinchanAIODL(url);

        if (!result) {
            return reply.status(500).send({ status: false, message: "Failed to fetch video data" });
        }

        return reply.status(200).send({ status: true, data: result });
    });
};
