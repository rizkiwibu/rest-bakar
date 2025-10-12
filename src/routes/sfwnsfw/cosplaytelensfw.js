const CosplayTele = require("../../scraper/cosplaytelensfw");
const validateApiKey = require("../../middlewares/validateApiKey");  // Import middleware

/**
 * @swagger
 * tags:
 *   name: sfwnsfw
 *   description: Kumpulan fitur SFW dan NSFW dalam API
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /sfwnsfw/cosplaytelensfw/search:
     *   get:
     *     summary: Mencari cosplay NSFW dari CosplayTele
     *     tags: [sfwnsfw]
     *     parameters:
     *       - name: query
     *         in: query
     *         required: true
     *         description: Kata kunci pencarian
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
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Query tidak diberikan
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/sfwnsfw/cosplaytelensfw/search", { preHandler: validateApiKey }, async (req, reply) => {
        const { query } = req.query;

        // Validasi query
        if (!query || query.trim() === "") {
            return reply.code(400).send({
                status: "error",
                creator: "rizkiirfan",
                message: "Query tidak boleh kosong"
            });
        }

        try {
            const cosplayTele = new CosplayTele();
            const result = await cosplayTele.search(query);

            return reply.code(200).send({
                status: "success",
                creator: "rizkiirfan",
                data: result
            });
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                creator: "rizkiirfan",
                message: "Terjadi kesalahan saat mengambil data!",
                error: error.message
            });
        }
    });

    /**
     * @swagger
     * /sfwnsfw/cosplaytelensfw/latest:
     *   get:
     *     summary: Mengambil cosplay terbaru dari CosplayTele
     *     tags: [sfwnsfw]
     *     parameters:
     *       - name: page
     *         in: query
     *         required: false
     *         description: Nomor halaman untuk pagination
     *         schema:
     *           type: integer
     *           default: 1
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan hasil cosplay terbaru
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Halaman tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/sfwnsfw/cosplaytelensfw/latest", { preHandler: validateApiKey }, async (req, reply) => {
        const { page = 1 } = req.query;

        if (page <= 0) {
            return reply.code(400).send({
                status: "error",
                creator: "rizkiirfan",
                message: "Halaman tidak valid"
            });
        }

        try {
            const cosplayTele = new CosplayTele();
            const result = await cosplayTele.latest(page);

            return reply.code(200).send({
                status: "success",
                creator: "rizkiirfan",
                data: result
            });
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                creator: "rizkiirfan",
                message: "Terjadi kesalahan saat mengambil data!",
                error: error.message
            });
        }
    });

    /**
     * @swagger
     * /sfwnsfw/cosplaytelensfw/detail:
     *   get:
     *     summary: Mengambil detail cosplay berdasarkan URL
     *     tags: [sfwnsfw]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL dari cosplay yang ingin diambil detailnya
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
     *         description: Berhasil mendapatkan detail cosplay
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: URL tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/sfwnsfw/cosplaytelensfw/detail", { preHandler: validateApiKey }, async (req, reply) => {
        const { url } = req.query;

        if (!url || url.trim() === "") {
            return reply.code(400).send({
                status: "error",
                creator: "rizkiirfan",
                message: "URL tidak valid"
            });
        }

        try {
            const cosplayTele = new CosplayTele();
            const result = await cosplayTele.detail(url);

            return reply.code(200).send({
                status: "success",
                creator: "rizkiirfan",
                data: result
            });
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                creator: "rizkiirfan",
                message: "Terjadi kesalahan saat mengambil data!",
                error: error.message
            });
        }
    });
};
