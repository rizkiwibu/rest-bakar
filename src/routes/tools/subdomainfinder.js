const SubdomainFinder = require("../../scraper/subdomainfinder");
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * tags:
 *   name: SubdomainFinder
 *   description: Temukan subdomain dari domain target
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /subdomainfinder:
     *   get:
     *     summary: Temukan subdomain dari domain
     *     tags: [SubdomainFinder]
     *     parameters:
     *       - name: domain
     *         in: query
     *         required: true
     *         description: Domain target misal example.com
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
     *         description: Daftar subdomain ditemukan
     *       400:
     *         description: Domain tidak boleh kosong
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/subdomainfinder", { preHandler: validateApiKey }, async (req, reply) => {
        const { domain } = req.query;

        if (!domain) {
            return reply.code(400).send({
                status: "error",
                message: "Domain tidak boleh kosong!"
            });
        }

        try {
            const result = await SubdomainFinder.findSubdomains(domain);
            return reply.code(200).send(result);
        } catch (err) {
            return reply.code(500).send({
                status: "error",
                message: "Gagal menemukan subdomain.",
                error: err.message
            });
        }
    });
};
