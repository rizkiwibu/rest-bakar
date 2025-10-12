const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey"); // Middleware API Key

/**
 * @swagger
 * tags:
 *   name: YouTube Downloader
 *   description: Fitur untuk mengunduh video/audio dari YouTube
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /ytdown:
     *   get:
     *     summary: Download video atau audio dari YouTube
     *     tags: [YouTube Downloader]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL video YouTube
     *         schema:
     *           type: string
     *       - name: format
     *         in: query
     *         required: true
     *         description: Format unduhan (mp3 atau mp4)
     *         schema:
     *           type: string
     *           enum: [mp3, mp4]
     *       - name: quality
     *         in: query
     *         required: false
     *         description: Kualitas video/audio yang diunduh
     *         schema:
     *           type: string
     *           enum: [96, 128, 256, 320, 144, 240, 360, 480, 720, 1080, auto]
     *           example: "720"
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan link unduhan
     *       400:
     *         description: Parameter tidak valid
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/ytdown", { preHandler: validateApiKey }, async (req, reply) => {
        const { url, format, quality = "auto" } = req.query;

        // Validasi parameter
        if (!url || !format) {
            return reply.code(400).send({
                status: "error",
                message: "Parameter url dan format wajib diisi!",
            });
        }

        // Validasi format
        if (!["mp3", "mp4"].includes(format)) {
            return reply.code(400).send({
                status: "error",
                message: "Format hanya bisa 'mp3' atau 'mp4'!",
            });
        }

        // Validasi quality berdasarkan format
        const validQualities = {
            mp3: ["96", "128", "256", "320", "auto"],
            mp4: ["144", "240", "360", "480", "720", "1080", "auto"],
        };

        if (!validQualities[format].includes(quality)) {
            return reply.code(400).send({
                status: "error",
                message: `Quality tidak valid untuk format ${format}! Pilihan: ${validQualities[format].join(", ")}`,
            });
        }

        try {
            const apiUrl = `https://fastrestapis.fasturl.cloud/downup/ytdown-v1?name=${encodeURIComponent(url)}&format=${format}&quality=${quality}`;
            const { data } = await axios.get(apiUrl);

            if (!data.result || !data.result.url) {
                return reply.code(404).send({
                    status: "error",
                    message: "Gagal mendapatkan link unduhan!",
                    creator: "RizkyAPI",
                });
            }

            return reply.code(200).send({
                status: "success",
                result: data.result,
                creator: "RizkyAPI",
            });
        } catch (error) {
            console.error("[YouTube Downloader] Error:", error.message);

            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan saat mengambil data!",
                error: error.message,
                creator: "RizkyAPI",
            });
        }
    });
};
