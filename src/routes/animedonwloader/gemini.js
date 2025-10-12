const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey");

const genAI = new GoogleGenerativeAI("AIzaSyDo5UzBHF1pETze7TbJ8WDyiWmRNKbxJy0");

/**
 * @swagger
 * tags:
 *   name: GeminiImage
 *   description: Menggunakan Google Gemini untuk memproses gambar dari URL dan mengirim hasilnya langsung
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /gemini/image:
     *   get:
     *     summary: Proses gambar dengan Gemini menggunakan URL dari pengguna dan kirim hasil langsung
     *     tags: [GeminiImage]
     *     parameters:
     *       - name: imageUrl
     *         in: query
     *         required: true
     *         description: URL gambar yang akan diproses oleh Gemini
     *         schema:
     *           type: string
     *       - name: query
     *         in: query
     *         required: true
     *         description: Prompt teks untuk memandu Gemini dalam memproses gambar
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
     *         description: Berhasil mendapatkan hasil dan mengirim gambar langsung
     *         content:
     *           image/png:
     *             schema:
     *               type: string
     *               format: binary
     *       400:
     *         description: imageUrl atau query tidak boleh kosong
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/gemini/image", { preHandler: validateApiKey }, async (req, reply) => {
        const { imageUrl, query } = req.query;

        if (!imageUrl || !query) {
            return reply.code(400).send({
                status: "error",
                message: "imageUrl dan query tidak boleh kosong!"
            });
        }

        try {
            // Ambil gambar dari URL
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
            const base64Image = Buffer.from(response.data).toString("base64");

            const contents = [
                { text: query },
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Image
                    }
                }
            ];

            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-exp-image-generation",
                generationConfig: {
                    responseModalities: ["Text", "Image"]
                }
            });

            const geminiResponse = await model.generateContent(contents);

            for (const part of geminiResponse.response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const imageBuffer = Buffer.from(part.inlineData.data, "base64");

                    // Kirim gambar langsung dengan header image/png
                    return reply
                        .code(200)
                        .header("Content-Type", "image/png")
                        .send(imageBuffer);
                }
            }
        } catch (error) {
            console.error("Error processing image:", error);
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan saat memproses gambar"
            });
        }
    });
};
