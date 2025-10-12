const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: sfwnsfw
 *   description: Kumpulan fitur SFW dan NSFW dalam API
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /sfwnsfw/hentaitv:
     *   get:
     *     summary: Mencari video di HentaiTV
     *     tags: [sfwnsfw]
     *     parameters:
     *       - name: name
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
     *         description: Berhasil mendapatkan hasil
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Query tidak boleh kosong
     *       500:
     *         description: Terjadi kesalahan server
     *     creator: rizkiirfan
     */
    fastify.get("/sfwnsfw/hentaitv", { preHandler: validateApiKey }, async (req, reply) => {
        const { name } = req.query;

        if (!name) {
            return reply.code(400).send({
                status: "error",
                message: "Parameter 'name' tidak boleh kosong!"
            });
        }

        try {
            const { data } = await axios.get(`https://fastrestapis.fasturl.cloud/sfwnsfw/hentaitv?name=${encodeURIComponent(name)}`);

            // Hapus properti "creator" jika ada
            if (data.creator) {
                delete data.creator;
            }

            return reply.code(200).send(data);
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan saat mengambil data!",
                error: error.message
            });
        }
    });
};
