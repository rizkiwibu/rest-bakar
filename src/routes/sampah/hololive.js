const { all } = require("../../scraper/aiCover");
const validateApiKey = require("../../middlewares/validateApiKey");
const axios = require("axios");

/**
 * @swagger
 * /aiCover:
 *   get:
 *     summary: Ubah suara menjadi voice member Hololive
 *     tags: [AiCover]
 *     parameters:
 *       - name: character
 *         in: query
 *         required: true
 *         description: "Nama karakter Hololive. Contoh: kobo, gura, miko"
 *         schema:
 *           type: string
 *       - name: audio
 *         in: query
 *         required: true
 *         description: "Link file audio format mp3 atau mpeg"
 *         schema:
 *           type: string
 *       - name: apikey
 *         in: query
 *         required: true
 *         description: "API key untuk autentikasi"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil mengubah suara (stream audio)
 *         content:
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parameter tidak boleh kosong
 *       403:
 *         description: API key tidak valid
 *       500:
 *         description: Terjadi kesalahan server
 */

module.exports = async (fastify) => {
    fastify.get("/aiCover", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const { character, audio } = req.query;
            if (!character || !audio) {
                return reply.code(400).send({
                    status: "error",
                    message: "Parameter character dan audio tidak boleh kosong"
                });
            }

            const res = await axios.get(audio, { responseType: "arraybuffer" });
            const buffer = Buffer.from(res.data);

            const result = await all(character, buffer);

            if (result.error) {
                return reply.code(500).send({
                    status: "error",
                    message: result.error
                });
            }

            const fileUrl = result.base64 || result.result?.base64;
            if (!fileUrl) {
                return reply.code(500).send({
                    status: "error",
                    message: "Gagal mendapatkan file audio dari result"
                });
            }

            const audioFile = await axios.get(fileUrl, { responseType: "arraybuffer" });

            reply.header("Content-Type", "audio/wav");
            reply.header("Content-Disposition", "attachment; filename=aiCover.wav");
            return reply.send(Buffer.from(audioFile.data));

        } catch (e) {
            return reply.code(500).send({
                status: "error",
                message: e.message
            });
        }
    });
};
