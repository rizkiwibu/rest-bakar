const pixiv = require("../../scraper/pixiv"); // Sesuaikan dengan lokasi scraper
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * tags:
 *   name: Pixiv
 *   description: Fitur pencarian dan unduhan ilustrasi dari Pixiv
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /pixiv/search:
     *   get:
     *     summary: Cari ilustrasi di Pixiv
     *     tags: [Pixiv]
     *     parameters:
     *       - name: query
     *         in: query
     *         required: true
     *         description: Kata kunci pencarian
     *         schema:
     *           type: string
     *       - name: page
     *         in: query
     *         required: false
     *         description: Nomor halaman
     *         schema:
     *           type: integer
     *       - name: order
     *         in: query
     *         required: false
     *         description: Urutan hasil (date_d, date, popular_d, dll.)
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
     *         description: Berhasil mendapatkan hasil pencarian
     *       400:
     *         description: Query tidak boleh kosong
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/pixiv/search", { preHandler: validateApiKey }, async (req, reply) => {
        const { query, page, order } = req.query;

        if (!query) {
            return reply.code(400).send({
                status: "error",
                message: "Query tidak boleh kosong!"
            });
        }

        try {
            const result = await pixiv.search(query, { page: Number(page) || 1, order });
            return reply.code(result.code).send(result);
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan server",
                error: error.message
            });
        }
    });

    /**
     * @swagger
     * /pixiv/download:
     *   get:
     *     summary: Unduh ilustrasi dari Pixiv
     *     tags: [Pixiv]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL ilustrasi dari Pixiv
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
     *         description: Berhasil mendapatkan ilustrasi
     *       400:
     *         description: URL tidak valid
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/pixiv/download", { preHandler: validateApiKey }, async (req, reply) => {
        const { url } = req.query;

        if (!url) {
            return reply.code(400).send({
                status: "error",
                message: "URL tidak boleh kosong!"
            });
        }

        try {
            const result = await pixiv.download(url);
            return reply.code(result.code).send(result);
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan server",
                error: error.message
            });
        }
    });
};
