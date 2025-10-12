const WavelAi = require("../../scraper/wavelAi"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Middleware API Key

/**
 * @swagger
 * tags:
 *   - OpenAI
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /wavelAi:
     *   get:
     *     summary: Konversi teks ke suara menggunakan Wavel AI
     *     tags:
     *       - OpenAI
     *     parameters:
     *       - name: text
     *         in: query
     *         required: true
     *         description: Teks yang akan dikonversi (maksimal 500 karakter)
     *         schema:
     *           type: string
     *       - name: lang
     *         in: query
     *         required: true
     *         description: Bahasa suara yang digunakan
     *         schema:
     *           type: string
     *           enum: [ml-IN, en-US, es-ES, ja-JP, id-ID, ko-KR, ru-RU]
     *       - name: voice
     *         in: query
     *         required: true
     *         description: Nama karakter suara yang diinginkan
     *         schema:
     *           type: string
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil menghasilkan suara
     *       400:
     *         description: Permintaan tidak valid (kesalahan input)
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Kesalahan server
     */
    fastify.get("/wavelAi", { preHandler: validateApiKey }, async (req, reply) => {
        const { text, lang, voice } = req.query;

        if (!text || !lang || !voice) {
            return reply.code(400).send({
                status: "error",
                message: "Semua parameter (text, lang, voice) harus diisi!"
            });
        }

        const result = await WavelAi.wavelAiTTS(text, lang, voice);

        if (result.status !== 200) {
            return reply.code(result.status).send({
                status: "error",
                message: result.error
            });
        }

        reply.header("Content-Type", "audio/mpeg");
        reply.send(result.audio);
    });

    /**
     * @swagger
     * /wavelAi/voices:
     *   get:
     *     summary: Mendapatkan daftar suara yang tersedia
     *     tags:
     *       - OpenAI
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan daftar suara
     */
    fastify.get("/wavelAi/voices", async (req, reply) => {
        reply.code(200).send(WavelAi.voices);
    });

    /**
     * @swagger
     * /wavelAi/languages:
     *   get:
     *     summary: Mendapatkan daftar bahasa yang tersedia
     *     tags:
     *       - OpenAI
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan daftar bahasa
     */
    fastify.get("/wavelAi/languages", async (req, reply) => {
        reply.code(200).send(WavelAi.languages);
    });
};
