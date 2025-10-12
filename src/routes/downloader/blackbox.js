const BlackBox = require("../../scraper/blackbox");
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * tags:
 *   name: OpenAI
 *   description: AI Chat menggunakan BlackBox
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /ai/blackbox:
     *   get:
     *     summary: Chat dengan AI menggunakan BlackBox
     *     tags: 
     *       - OpenAI
     *     parameters:
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *       - name: msg
     *         in: query
     *         required: true
     *         description: Pesan untuk AI
     *         schema:
     *           type: string
     *       - name: model
     *         in: query
     *         required: true
     *         description: Model yang digunakan (gemini, deepseek-r1, deepseek-v3)
     *         schema:
     *           type: string
     *       - name: history
     *         in: query
     *         required: false
     *         description: Riwayat percakapan
     *         schema:
     *           type: array
     *           items:
     *             type: object
     *       - name: prompt
     *         in: query
     *         required: false
     *         description: Prompt khusus (opsional)
     *         schema:
     *           type: string
     *       - name: codeMode
     *         in: query
     *         required: false
     *         description: Mode pemrograman (true/false)
     *         schema:
     *           type: boolean
     *       - name: deepsearch
     *         in: query
     *         required: false
     *         description: Mode pencarian mendalam (true/false)
     *         schema:
     *           type: boolean
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan respons AI
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Input tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/ai/blackbox", { preHandler: validateApiKey }, async (req, reply) => {
        const { msg, model, history, prompt, codeMode, deepsearch } = req.query;

        if (!msg || !model) {
            return reply.code(400).send({
                status: "error",
                message: "Pesan dan model harus diisi!"
            });
        }

        try {
            const result = await BlackBox(msg, false, model, JSON.parse(history || '[]'), prompt || null, codeMode || false, deepsearch || false);
            return reply.code(200).send(result);
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan server",
                error: error.message
            });
        }
    });
};
