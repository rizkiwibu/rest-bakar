const Scraper = require("../../scraper/ssweb"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: SSWeb
 *   description: Mengambil screenshot dari website berdasarkan URL
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /ssweb:
     *   get:
     *     summary: Ambil screenshot website dari URL
     *     tags: [SSWeb]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL website yang ingin di-screenshot
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
     *         description: Berhasil mendapatkan screenshot dalam format PNG
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: URL tidak boleh kosong
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/ssweb", { preHandler: validateApiKey }, async (req, reply) => {
        const { url } = req.query;

        if (!url) {
            return reply.code(400).send({
                status: "error",
                message: "URL tidak boleh kosong!",
            });
        }

        try {
            const result = await Scraper.Screenshot(url);
            reply.type(result.type).send(result.buffer);
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: error.message,
            });
        }
    });
};
