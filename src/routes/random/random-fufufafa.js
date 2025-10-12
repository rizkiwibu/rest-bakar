// routes/fufufafa.js
const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey");

module.exports = async (fastify) => {
    /**
     * @swagger
     * /random/fufufafa:
     *   get:
     *     summary: Mengambil kutipan acak dari FufuFafa
     *     tags: [FufuFafa]
     *     parameters:
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Kutipan acak berhasil diambil
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/random/fufufafa", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const { data } = await axios.get("https://raw.githubusercontent.com/rizkiwibu/fufufafa-quotes-fetcher/refs/heads/main/fufufafa.json");
            const random = data[Math.floor(Math.random() * data.length)];
            return reply.send(random);
        } catch (err) {
            return reply.code(500).send({
                status: "error",
                message: "Gagal mengambil data fufufafa",
                error: err.message
            });
        }
    });

    /**
     * @swagger
     * /all/fufufafa:
     *   get:
     *     summary: Mengambil semua kutipan teks dari FufuFafa
     *     tags: [FufuFafa]
     *     parameters:
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Daftar kutipan berhasil diambil
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/all/fufufafa", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const { data } = await axios.get("https://raw.githubusercontent.com/rizkiwibu/fufufafa-quotes-fetcher/refs/heads/main/fufufafa.json");
            const list = data.map(item => item.data?.content).filter(Boolean);
            return reply.send(list);
        } catch (err) {
            return reply.code(500).send({
                status: "error",
                message: "Gagal mengambil data fufufafa",
                error: err.message
            });
        }
    });
};
