const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: Brat
 *   description: Deskripsi fitur API ini untuk membuat gambar dan animasi Brat
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /bardvidio:
     *   get:
     *     summary: Membuat animasi Brat (GIF/Video) dan langsung menampilkannya
     *     tags: [Brat]
     *     parameters:
     *       - name: text
     *         in: query
     *         required: true
     *         description: Teks yang ingin ditampilkan pada animasi Brat
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
     *         description: Animasi berhasil dibuat dan langsung ditampilkan
     *         content:
     *           image/gif:
     *             schema:
     *               type: string
     *               format: binary
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Teks tidak boleh kosong
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/bardvidio", { preHandler: validateApiKey }, async (req, reply) => {
        const { text } = req.query;

        if (!text) {
            return reply.code(400).send({
                status: "error",
                message: "Query parameter 'text' tidak boleh kosong!",
            });
        }

        try {
            const apiUrl = `https://fastrestapis.fasturl.cloud/maker/brat/animated?text=${encodeURIComponent(text)}&mode=animated`;

            const response = await axios.get(apiUrl, {
                responseType: "arraybuffer",
            });

            return reply
                .code(200)
                .header("Content-Type", response.headers['content-type'] || "image/gif")
                .send(Buffer.from(response.data));
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                creator: "rizkiirfan",
                message: "Terjadi kesalahan saat mengambil animasi",
                error: error.message,
            });
        }
    });
};
