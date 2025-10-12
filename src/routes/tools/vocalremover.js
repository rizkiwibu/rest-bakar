const axios = require('axios');
const FormData = require('form-data');
const { noiseRemoval } = require("../../scraper/noiseremoval"); // Import modul noiseRemoval

const validateApiKey = require("../../middlewares/validateApiKey"); // Middleware untuk validasi API key

/**
 * @swagger
 * tags:
 *   name: VocalRemover
 *   description: Fitur untuk menghapus noise pada file audio atau video
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /vocalremover:
     *   get:
     *     summary: Menghapus noise dari file audio/video
     *     tags: [VocalRemover]
     *     parameters:
     *       - name: url
     *         in: query
     *         required: true
     *         description: URL file audio atau video yang ingin dihapus noise-nya
     *         schema:
     *           type: string
     *       - name: mode
     *         in: query
     *         required: false
     *         description: Mode noise removal, default 'pulse' (pulse/orbit)
     *         schema:
     *           type: string
     *           default: pulse
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil menghapus noise, link media hasil
     *       400:
     *         description: URL atau format file tidak valid
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/vocalremover", { preHandler: validateApiKey }, async (req, reply) => {
        const { url, mode = 'pulse' } = req.query;

        // Validasi URL
        if (!url) {
            return reply.code(400).send({
                status: "error",
                message: "URL file audio/video tidak boleh kosong!"
            });
        }

        // Memanggil fungsi remove noise
        const result = await noiseRemoval.remove(url, mode);

        if (!result.status) {
            return reply.code(result.code).send({
                status: "error",
                message: result.result.error || "Terjadi kesalahan dalam menghapus noise"
            });
        }

        // Mengembalikan hasil link media yang sudah dibersihkan
        return reply.code(result.code).send({
            status: "success",
            message: "Berhasil menghapus noise",
            data: {
                media_url: result.result.media
            }
        });
    });
};
