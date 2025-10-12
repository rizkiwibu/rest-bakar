const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware validasi API Key

/**
 * @swagger
 * /download/jav:
 *   get:
 *     summary: Download JAV Video
 *     tags:
 *       - Download
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL of the JAV video page
 *       - in: query
 *         name: apikey
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: Successfully fetched video details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 title:
 *                   type: string
 *                   description: The title of the video
 *                 thumbnail:
 *                   type: string
 *                   description: The thumbnail URL of the video
 *                 videoUrl:
 *                   type: string
 *                   description: The direct download URL of the video
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

module.exports = async (fastify) => {
  fastify.get("/download/jav", { preHandler: validateApiKey }, async (request, reply) => {
    const { url } = request.query;

    if (!url) {
      return reply.status(400).send({ error: "URL tidak boleh kosong!" });
    }

    try {
      const apiUrl = `https://api.malik-jmk.web.id/api/nsfw/javhd?action=detail&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.media || !data.media.sources || data.media.sources.length === 0) {
        return reply.status(400).send({ error: "Gagal mengambil video." });
      }

      const videoUrl = data.media.sources[0].src;

      return reply.send({
        status: true,
        title: data.title,
        thumbnail: data.thumbnail || null,
        videoUrl,
      });
    } catch (error) {
      console.error("Error:", error.message);
      return reply.status(500).send({ error: "Terjadi kesalahan saat mengambil data." });
    }
  });
};
