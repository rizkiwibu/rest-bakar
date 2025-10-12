const { deepSeek } = require("../../scraper/deepseek");
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * tags:
 *   name: DeepSeek
 *   description: Chat dengan model DeepSeek R1 Distill LLaMA 70B
 */

module.exports = async (fastify) => {
  /**
   * @swagger
   * /deepseek:
   *   get:
   *     summary: Chat dengan DeepSeek AI
   *     tags: [DeepSeek]
   *     parameters:
   *       - name: prompt
   *         in: query
   *         required: true
   *         description: Pesan atau pertanyaan untuk AI
   *         schema:
   *           type: string
   *           example: "Jelaskan teori relativitas dalam bahasa gaul!"
   *       - name: session
   *         in: query
   *         required: false
   *         description: Session ID untuk melanjutkan percakapan
   *         schema:
   *           type: string
   *           example: "a1b2c3d4e5f6g7h8"
   *       - name: think
   *         in: query
   *         required: false
   *         description: Tampilkan juga bagian <think>
   *         schema:
   *           type: boolean
   *           example: false
   *       - name: apikey
   *         in: query
   *         required: true
   *         description: API key untuk autentikasi
   *         schema:
   *           type: string
   *           example: "free"
   *     responses:
   *       200:
   *         description: Balasan dari AI
   *         content:
   *           application/json:
   *             example:
   *               status: success
   *               code: 200
   *               result: "Gampangnya, teori relativitas itu bilang waktu dan ruang bisa beda tergantung siapa yang ngelihat. Kayak lo nonton mobil lewat, bisa beda rasanya kalau lo lagi di mobilnya langsung!"
   *               sessionId: "a1b2c3d4e5f6g7h8"
   *               sessionExpiry: "2025-05-02T13:30:00.000Z"
   *               messageCount:
   *                 current: 2
   *                 max: 100
   *               isNewSession: true
   *               isFollowUp: false
   *               think: false
   *       400:
   *         description: Input atau parameter tidak valid
   *       403:
   *         description: API key tidak valid
   *       500:
   *         description: Terjadi kesalahan pada server
   */
  fastify.get("/deepseek", { preHandler: validateApiKey }, async (req, reply) => {
    const { prompt, session, think } = req.query;

    const result = await deepSeek.chat(prompt, session, think === 'true');

    return reply.code(result.code).send({
      status: result.success ? "success" : "error",
      ...result
    });
  });
};
