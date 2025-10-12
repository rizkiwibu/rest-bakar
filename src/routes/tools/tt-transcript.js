const axios = require('axios');
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

module.exports = async (fastify) => {
    /**
     * @swagger
     * /tool/tt-transcript:
     *   get:
     *     summary: Mendapatkan transkrip dari video TikTok berdasarkan URL
     *     tags: 
     *       - transcript
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL video TikTok yang ingin diambil transkripnya
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
     *         description: Berhasil mendapatkan transkrip dari video TikTok
     *       400:
     *         description: URL video TikTok tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/tool/tt-transcript", { preHandler: validateApiKey }, async (req, reply) => {
        const { url } = req.query;

        // Validasi URL
        if (!url) {
            return reply.code(400).send({
                status: "error",
                message: "URL video TikTok tidak boleh kosong!"
            });
        }

        try {
            // Memanggil API eksternal untuk mendapatkan transkrip dari video TikTok
            const response = await axios.get(`https://fastrestapis.fasturl.cloud/tool/tt-transcript?url=${encodeURIComponent(url)}`);

            // Memastikan API eksternal mengembalikan status 200
            if (response.status === 200) {
                const data = response.data;

                // Mengirimkan hasil transkrip video TikTok tanpa elemen "creator"
                return reply.code(200).send({
                    status: "success",
                    result: {
                        subtitlesTimecode: data.result.subtitlesTimecode,
                        subtitlesNonTimecode: data.result.subtitlesNonTimecode
                    }
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
