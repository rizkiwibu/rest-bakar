const axios = require('axios');
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

module.exports = async (fastify) => {
    /**
     * @swagger
     * /tool/yt-transcript:
     *   get:
     *     summary: Mendapatkan transkrip dari video YouTube berdasarkan URL
     *     tags: 
     *       - transcript
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL video YouTube yang ingin diambil transkripnya
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
     *         description: Berhasil mendapatkan transkrip dari video YouTube
     *       400:
     *         description: URL video YouTube tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/tool/yt-transcript", { preHandler: validateApiKey }, async (req, reply) => {
        const { url } = req.query;

        // Validasi URL
        if (!url) {
            return reply.code(400).send({
                status: "error",
                message: "URL video YouTube tidak boleh kosong!"
            });
        }

        try {
            // Memanggil API eksternal untuk mendapatkan transkrip dari video YouTube
            const response = await axios.get(`https://fastrestapis.fasturl.cloud/tool/yt-transcript?url=${encodeURIComponent(url)}`);

            // Memastikan API eksternal mengembalikan status 200
            if (response.status === 200 && response.data) {
                const { result, message } = response.data;

                // Mengirimkan hasil transkrip video YouTube tanpa informasi creator
                return reply.code(200).send({
                    status: "success",
                    message: message || "Success",
                    result: result || ""
                });
            } else {
                return reply.code(500).send({
                    status: "error",
                    message: "Terjadi kesalahan saat mengakses API eksternal"
                });
            }
        } catch (error) {
            // Menangani error jika terjadi kesalahan dalam memanggil API eksternal
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan server",
                error: error.message
            });
        }
    });
};
