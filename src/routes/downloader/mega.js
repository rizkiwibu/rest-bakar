const megaDownloader = require("../../scraper/mega"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware apikey

/**
 * @swagger
 * tags:
 *   name: MegaDownloader
 *   description: Download file dari Mega.nz menggunakan link
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /megaDownloader:
     *   get:
     *     summary: Download file dari Mega.nz menggunakan URL
     *     tags: [MegaDownloader]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL file Mega.nz
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
     *         description: Berhasil mendapatkan link download
     *       400:
     *         description: Request error, seperti URL kosong
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Server error
     */
    fastify.get("/megaDownloader", { preHandler: validateApiKey }, async (req, reply) => {
        const { url } = req.query;

        if (!url) {
            return reply.code(400).send({
                status: false,
                message: "Parameter 'url' tidak boleh kosong!"
            });
        }

        try {
            const result = await megaDownloader(url);

            if (!result.status) {
                return reply.code(400).send(result); // Kalau gagal scrape
            }

            return reply.code(200).send(result);
        } catch (err) {
            console.error(err);
            return reply.code(500).send({
                status: false,
                message: "Terjadi kesalahan server: " + err.message
            });
        }
    });
};
