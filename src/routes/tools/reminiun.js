const ReminiScraper = require("../../scraper/remini"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: Remini
 *   description: Enhance images using AI
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /remini:
     *   get:
     *     summary: Enhance an image from URL using AI
     *     tags: [Remini]
     *     parameters:
     *       - name: image_url
     *         in: query
     *         required: true
     *         description: Direct image URL
     *         schema:
     *           type: string
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key for authentication
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Successfully enhanced the image
     *       403:
     *         description: Invalid API key
     *       400:
     *         description: Image URL is required
     *       500:
     *         description: Internal server error
     */
    fastify.get("/remini", { preHandler: validateApiKey }, async (req, reply) => {
        const { image_url } = req.query;

        if (!image_url) {
            return reply.code(400).send({
                status: "error",
                message: "Image URL is required!"
            });
        }

        try {
            const enhancedUrl = await ReminiScraper.unblur(image_url);
            return reply.code(200).send({
                status: "success",
                url: enhancedUrl
            });
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: error.message
            });
        }
    });
};
