const Scraper = require("../../scraper/hentaivideo"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: sfwnsfw
 *   description: Mendapatkan daftar video hentai dari SFMCompile
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /sfwnsfw/hentaivideo:
     *   get:
     *     summary: Mendapatkan daftar video hentai acak
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
     *         description: Berhasil mendapatkan daftar video hentai
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/sfwnsfw/hentaivideo", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const result = await Scraper.getHentaiList();
            return reply.code(200).send({
                status: "success",
                total: result.length,
                data: result,
            });
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: error.message,
            });
        }
    });
};
