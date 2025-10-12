const { jadwalSolat, searchCity } = require("../../scraper/jadwalsolat"); // Import scraper
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
     * /jadwalsolat:
     *   get:
     *     summary: Mendapatkan jadwal sholat berdasarkan kota
     *     tags: [WaktuDunia]
     *     parameters:
     *       - name: kota
     *         in: query
     *         required: true
     *         description: Nama kota untuk mendapatkan jadwal sholat
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
     *         description: Berhasil mendapatkan jadwal sholat
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Kota tidak boleh kosong
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/jadwalsolat", { preHandler: validateApiKey }, async (req, reply) => {
        const { kota } = req.query;

        if (!kota) {
            return reply.code(400).send({
                status: "error",
                message: "Kota tidak boleh kosong!"
            });
        }

        try {
            const result = await jadwalSolat(kota);
            return reply.code(200).send({
                status: "success",
                kota,
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
