const fetch = require("node-fetch");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware untuk validasi API key

/**
 * @swagger
 * /textimg:
 *   get:
 *     summary: Convert text to image using AI generation
 *     tags:
 *       - OpenAI
 *     parameters:
 *       - name: prompt
 *         in: query
 *         required: true
 *         description: Prompt describing the desired image
 *         schema:
 *           type: string
 *       - name: negative
 *         in: query
 *         required: false
 *         description: Negative prompt describing what to avoid
 *         schema:
 *           type: string
 *       - name: model
 *         in: query
 *         required: false
 *         description: Model to use for image generation (flux, PHOTOREALISTIC13)
 *         schema:
 *           type: string
 *           default: flux
 *       - name: size
 *         in: query
 *         required: false
 *         description: Size of the generated image
 *         schema:
 *           type: string
 *           default: 1024x1024
 *       - name: apikey
 *         in: query
 *         required: true
 *         description: API key for authentication
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully generated images
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Request status
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: URLs of the generated images
 */

module.exports = async (fastify) => {
    // Menggunakan middleware untuk validasi API key
    fastify.get("/textimg", { preHandler: validateApiKey }, async (request, reply) => {
        const { prompt, negative = "", model = "flux", size = "1024x1024" } = request.query;

        if (!prompt) {
            return reply.code(400).send({ status: false, message: "Prompt is required" });
        }

        const url = "https://aicreate.com/wp-admin/admin-ajax.php";
        const params = new URLSearchParams({
            action: "text_to_image_handle",
            caption: prompt,
            negative_prompt: negative,
            model_version: model,
            size,
        });

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    accept: "*/*",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    origin: "https://aicreate.com",
                    referer: "https://aicreate.com/text-to-image-generator/",
                    "x-requested-with": "XMLHttpRequest",
                    "user-agent":
                        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.169 Mobile/15E148 Safari/604.1",
                },
                body: params,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const regex = /src="(https:\/\/aicdn\.picsart\.com\/[a-f0-9-]+\.jpg)"/g;
            const match = [...data.html.matchAll(regex)];

            const images = match.slice(0, 2).map((m) => m[1]);

            return {
                status: true,
                images: images.length ? images : [],
            };
        } catch (error) {
            console.error("Error:", error);
            return reply.code(500).send({ status: false, message: "Internal Server Error" });
        }
    });
};
