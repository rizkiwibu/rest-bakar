const NekoPoi = require("../../scraper/nekopoi");
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * tags:
 *   name: sfwnsfw
 *   description: Kumpulan fitur SFW dan NSFW dalam API
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /sfwnsfw/nekopoi/latest:
     *   get:
     *     summary: Mendapatkan daftar anime terbaru dari Nekopoi
     *     tags: [sfwnsfw]
     *     parameters:
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan daftar anime terbaru
     */
    fastify.get("/sfwnsfw/nekopoi/latest", { preHandler: validateApiKey }, async () => {
        return await NekoPoi.latest();
    });

    /**
     * @swagger
     * /sfwnsfw/nekopoi/detail:
     *   get:
     *     summary: Mendapatkan detail anime dari Nekopoi
     *     tags: [sfwnsfw]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL detail anime
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
     *         description: Berhasil mendapatkan detail anime
     */
    fastify.get("/sfwnsfw/nekopoi/detail", { preHandler: validateApiKey }, async (req) => {
        const { url } = req.query;
        if (!url) {
            return { status: false, message: "URL tidak boleh kosong" };
        }
        return await NekoPoi.detail(url);
    });

    /**
     * @swagger
     * /sfwnsfw/nekopoi/episode:
     *   get:
     *     summary: Mendapatkan informasi episode dari Nekopoi
     *     tags: [sfwnsfw]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL episode anime
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
     *         description: Berhasil mendapatkan data episode
     */
    fastify.get("/sfwnsfw/nekopoi/episode", { preHandler: validateApiKey }, async (req) => {
        const { url } = req.query;
        if (!url) {
            return { status: false, message: "URL tidak boleh kosong" };
        }
        return await NekoPoi.episode(url);
    });

    /**
     * @swagger
     * /sfwnsfw/nekopoi/search:
     *   get:
     *     summary: Mencari anime dari Nekopoi
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
     */
    fastify.get("/sfwnsfw/nekopoi/search", { preHandler: validateApiKey }, async (req) => {
        const { query } = req.query;
        if (!query) {
            return { status: false, message: "Query tidak boleh kosong" };
        }
        return await NekoPoi.search(query);
    });
};
