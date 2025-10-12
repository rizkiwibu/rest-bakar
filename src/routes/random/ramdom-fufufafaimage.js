const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * tags:
 *   name: FufuFafa
 *   description: API untuk mendapatkan kutipan dan gambar FufuFafa
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /random/fufufafa/image:
     *   get:
     *     summary: Mendapatkan gambar FufuFafa secara random dari dua repository
     *     tags: [FufuFafa]
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
    fastify.get("/random/fufufafa/image", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const sources = [
                "https://api.github.com/repos/fufufufafafa/fufufafa-memorable-quotes/contents/img?ref=main",
                "https://api.github.com/repos/rizkiwibu/fufufafa-quotes-fetcher/contents/public/img?ref=main"
            ];

            const headers = {
                "User-Agent": "rizkyapi",
                ...(process.env.GITHUB_TOKEN && {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
                })
            };

            const responses = await Promise.all(
                sources.map(url => axios.get(url, { headers }))
            );

            const allImages = responses.flatMap(res =>
                res.data
                    .filter(file => file.type === "file" && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
                    .map(file => file.download_url)
            );

            if (!allImages.length) {
                return reply.code(500).send({
                    status: "error",
                    message: "Tidak ada gambar yang ditemukan."
                });
            }

            const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
            const imageRes = await axios.get(randomImage, { responseType: "arraybuffer" });

            const contentType = imageRes.headers["content-type"] || "image/jpeg";
            return reply
                .code(200)
                .header("Content-Type", contentType)
                .send(Buffer.from(imageRes.data));
        } catch (err) {
            return reply.code(500).send({
                status: "error",
                message: `Gagal mengambil gambar: ${err.message}`
            });
        }
    });
};
