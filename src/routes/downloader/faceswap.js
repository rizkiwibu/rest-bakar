const faceswap = require("../../scraper/faceswap"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: OpenAI
 *   description: Fitur FaceSwap menggunakan AI
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /faceswap:
     *   get:
     *     summary: Tukar wajah menggunakan AI Face Swap
     *     tags: [OpenAI]
     *     parameters:
     *       - name: original
     *         in: query
     *         required: true
     *         description: URL gambar target (foto yang akan ditukar wajahnya)
     *         schema:
     *           type: string
     *       - name: target
     *         in: query
     *         required: true
     *         description: URL gambar wajah yang ingin ditempel
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
     *         description: Berhasil mendapatkan hasil FaceSwap
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Parameter tidak boleh kosong
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/faceswap", { preHandler: validateApiKey }, async (req, reply) => {
        const { original, target } = req.query;

        if (!original || !target) {
            return reply.code(400).send({
                status: "error",
                message: "Parameter 'original' dan 'target' tidak boleh kosong!"
            });
        }

        const result = await faceswap(original, target);
        return reply.code(result.status).send(result);
    });
};
