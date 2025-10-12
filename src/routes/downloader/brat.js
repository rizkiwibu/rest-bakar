const BratGenerator = require("../../scraper/bratGenerator"); // Import Brat Generator
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: Brat
 *   description: Deskripsi fitur API ini untuk membuat gambar Brat dan langsung menampilkannya
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /brat:
     *   get:
     *     summary: Membuat gambar Brat dan langsung menampilkannya
     *     tags: [Brat]
     *     parameters:
     *       - name: text
     *         in: query
     *         required: true
     *         description: Teks yang ingin ditampilkan pada gambar Brat
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
     *         description: Gambar berhasil dibuat dan langsung ditampilkan
     *         content:
     *           image/png:
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
    fastify.get("/brat", { preHandler: validateApiKey }, async (req, reply) => {
        const { text } = req.query;

        // Validasi input teks
        if (!text) {
            return reply.code(400).send({
                status: "error",
                message: "Query parameter 'text' tidak boleh kosong!",
            });
        }

        try {
            // Menghasilkan gambar Brat
            const buffer = await BratGenerator(text);

            // Menampilkan gambar langsung
            return reply
                .code(200)
                .header("Content-Type", "image/png")
                .send(Buffer.from(buffer));
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                creator: "rizkiirfan",
                message: "Terjadi kesalahan server",
                error: error.message,
            });
        }
    });
};
