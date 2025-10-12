const axios = require('axios');
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

/**
 * @swagger
 * tags:
 *   name: GetContact
 *   description: Fitur untuk mendapatkan informasi kontak berdasarkan nomor telepon
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /getcontact:
     *   get:
     *     summary: Mendapatkan informasi kontak berdasarkan nomor telepon
     *     tags: [GetContact]
     *     parameters:
     *       - name: number
     *         in: query
     *         required: true
     *         description: Nomor telepon untuk mendapatkan informasi kontak
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
     *         description: Berhasil mendapatkan informasi kontak
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Nomor telepon atau API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    
    fastify.get('/getcontact', { preHandler: validateApiKey }, async (request, reply) => {
        const { number, apikey } = request.query;

        // Validasi parameter nomor telepon
        if (!number) {
            return reply.code(400).send({ message: 'Number parameter is required' });
        }

        try {
            const response = await axios.get(`https://fastrestapis.fasturl.cloud/tool/getcontact?number=${number}`);
            const { data } = response;

            if (data.status === 200 && data.result) {
                return reply.send({
                    name: data.result.userData.name,
                    phone: data.result.userData.phone,
                    provider: data.result.userData.provider,
                    tags: data.result.tags,
                });
            } else {
                return reply.code(404).send({ message: 'Contact information not found' });
            }
        } catch (error) {
            console.error('Error fetching contact data:', error);
            return reply.code(500).send({ message: 'Internal Server Error' });
        }
    });
};
