const waktu = require("../../scraper/waktudunia"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: WaktuDunia
 *   description: Mendapatkan waktu di berbagai kota di dunia
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /waktudunia:
     *   get:
     *     summary: Mendapatkan waktu saat ini dari berbagai kota dunia
     *     tags: [WaktuDunia]
     *     parameters:
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan waktu dunia
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/waktudunia", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const result = await waktu();
            if (result.length === 0) {
                return reply.code(500).send({
                    status: "error",
                    message: "Gagal mengambil data waktu dunia"
                });
            }
            return reply.code(200).send({
                status: "success",
                data: result
            });
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan server",
                error: error.message
            });
        }
    });
};
