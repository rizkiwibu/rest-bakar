const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * /ai/yanzgpt:
 *   get:
 *     summary: Generate response using Yanz-GPT
 *     tags:
 *       - OpenAI
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Pertanyaan dari pengguna
 *       - in: query
 *         name: prompt
 *         required: true
 *         schema:
 *           type: string
 *         description: Pesan sistem yang memberikan konteks
 *       - in: query
 *         name: model
 *         required: false
 *         schema:
 *           type: string
 *           enum: [yanzgpt-revolution-25b-v3.5, yanzgpt-legacy-72b-v3.5, yanzgpt-r1-70b-v3.5]
 *         description: |
 *           Pilih model AI yang digunakan.
 *           Default: yanzgpt-revolution-25b-v3.5
 *       - in: query
 *         name: apikey
 *         required: true
 *         schema:
 *           type: string
 *         description: API key untuk autentikasi
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan respons dari Yanz-GPT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status permintaan
 *                 result:
 *                   type: string
 *                   description: Respons dari Yanz-GPT
 *       400:
 *         description: Bad request (parameter kurang)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Pesan kesalahan
 *       403:
 *         description: API key tidak valid
 *       500:
 *         description: Internal server error
 */


module.exports = async (fastify) => {
  fastify.get("/ai/yanzgpt", { preHandler: validateApiKey }, async (request, reply) => {
    const { query, prompt, model } = request.query;

    if (!query || !prompt) {
      return reply.status(400).send({ error: "Parameter 'query' dan 'prompt' wajib diisi!" });
    }

    const requestData = {
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: query },
      ],
      model: model || "yanzgpt-revolution-25b-v3.5",
    };

    try {
      const response = await axios.post("https://api.yanzgpt.my.id/v1/chat", requestData, {
        headers: {
          authorization: "Bearer yzgpt-sc4tlKsMRdNMecNy",
          "content-type": "application/json",
        },
      });

      return reply.send({
        status: true,
        result: response.data.response,
      });
    } catch (error) {
      console.error("Error:", error.message);
      return reply.status(500).send({ error: "Terjadi kesalahan saat memproses permintaan Yanz-GPT." });
    }
  });
};
