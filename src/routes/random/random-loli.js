const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: Random
 *   description: API untuk mendapatkan gambar random
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /random/loli:
     *   get:
     *     summary: Mendapatkan gambar loli secara random
     *     tags: [Random]
     *     parameters:
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan gambar
     *         content:
     *           image/png:
     *             schema:
     *               type: string
     *               format: binary
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */

    fastify.get("/random/loli", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const { data } = await axios.get(
                "https://raw.githubusercontent.com/rynxzyy/loli-r-img/refs/heads/main/links.json"
            );
            const imageUrl = data[Math.floor(Math.random() * data.length)];
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

            reply
                .code(200)
                .header("Content-Type", "image/png")
                .send(Buffer.from(response.data));
        } catch (error) {
            reply.code(500).send({
                status: "error",
                message: `Error: ${error.message}`,
            });
        }
    });
};
