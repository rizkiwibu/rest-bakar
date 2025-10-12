const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: Random
 *   description: API untuk mendapatkan gambar cosplayer random
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /random/cosplayer:
     *   get:
     *     summary: Mendapatkan gambar cosplayer secara random
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

    fastify.get("/random/cosplayer", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const sources = [
                "https://raw.githubusercontent.com/rizkiwibu/random-isi/refs/heads/master/data/cosplayloli.json",
                "https://raw.githubusercontent.com/rizkiwibu/random-isi/refs/heads/master/data/cosplaysagiri.json",
                "https://raw.githubusercontent.com/rizkiwibu/random-isi/refs/heads/master/data/cosplay.json"
            ];
            
            // Fetch all sources concurrently
            const responses = await Promise.all(sources.map(url => axios.get(url)));
            
            // Combine all images into one array
            const images = responses.flatMap(res => res.data);
            
            // Select a random image
            const imageUrl = images[Math.floor(Math.random() * images.length)];
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
