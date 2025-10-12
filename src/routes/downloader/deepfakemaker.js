const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware validasi API Key

/**
 * @swagger
 * /ai/deepfakemaker:
 *   get:
 *     summary: Generate Deepfake Image
 *     tags:
 *       - OpenAI
 *     parameters:
 *       - in: query
 *         name: prompt
 *         required: true
 *         schema:
 *           type: string
 *         description: The description for the deepfake image
 *       - in: query
 *         name: apikey
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: Successfully generated deepfake image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 imageUrl:
 *                   type: string
 *                   description: The generated deepfake image URL
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
  fastify.get("/ai/deepfakemaker", { preHandler: validateApiKey }, async (request, reply) => {
    const { prompt } = request.query;

    if (!prompt) {
      return reply.status(400).send({ error: "Prompt tidak boleh kosong!" });
    }

    try {
      const apiUrl = `https://api.malik-jmk.web.id/api/ai/image/deepfakemaker?prompt=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.result) {
        return reply.status(400).send({ error: "Gagal menghasilkan gambar deepfake." });
      }

      return reply.send({
        status: true,
        imageUrl: data.result,
      });
    } catch (error) {
      console.error("Error:", error.message);
      return reply.status(500).send({ error: "Terjadi kesalahan saat mengambil data." });
    }
  });
};
