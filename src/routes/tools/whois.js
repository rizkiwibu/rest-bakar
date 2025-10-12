const axios = require('axios');
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: Whois
 *   description: Fitur untuk mengambil informasi Whois domain
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /whois:
     *   get:
     *     summary: Mendapatkan informasi Whois dari domain
     *     tags: [Whois]
     *     parameters:
     *       - name: domain
     *         in: query
     *         required: true
     *         description: Nama domain untuk pencarian Whois
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
     *         description: Berhasil mendapatkan informasi Whois
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Domain atau API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    
    fastify.get('/whois', { preHandler: validateApiKey }, async (request, reply) => {
        const { domain, apikey } = request.query;

        // Validasi parameter domain
        if (!domain) {
            return reply.code(400).send({ message: 'Domain parameter is required' });
        }

        try {
            const response = await axios.get(`https://fastrestapis.fasturl.cloud/tool/whois?domain=${domain}`);
            const { data } = response;

            if (data.status === 200 && data.result) {
                return reply.send({
                    domain: data.result.domain,
                    ip_addresses: data.result.ip_addresses,
                    whois: data.result.whois,
                    nameservers: data.result.nameservers,
                    dns_records: data.result.dns_records,
                    reverse_dns: data.result.reverse_dns,
                    ssl_tls_info: data.result.ssl_tls_info,
                });
            } else {
                return reply.code(404).send({ message: 'Whois information not found' });
            }
        } catch (error) {
            console.error('Error fetching Whois data:', error);
            return reply.code(500).send({ message: 'Internal Server Error' });
        }
    });
};
