const Scraper = require("../../scraper/mediashare"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: MediaShare
 *   description: Mendapatkan link unduhan dari MediaFire
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /mediashare:
     *   get:
     *     summary: Mendapatkan link unduhan dari MediaFire
     *     tags: [MediaShare]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL MediaFire yang ingin diunduh
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
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: URL tidak boleh kosong atau tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/mediashare", { preHandler: validateApiKey }, async (req, reply) => {
        const { url } = req.query;

        if (!url || !url.includes("mediafire.com")) {
            return reply.code(400).send({
                status: "error",
                message: "URL tidak boleh kosong dan harus berasal dari MediaFire!"
            });
        }

        try {
            const result = await Scraper.MediaFire(url);
            return reply.code(200).send(result);
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: error.message
            });
        }
    });
};
