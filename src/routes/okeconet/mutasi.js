const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * tags:
 *   name: QRIS
 *   description: Cek mutasi transaksi QRIS
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /qris/mutasi:
     *   get:
     *     summary: Cek mutasi transaksi QRIS
     *     tags: [QRIS]
     *     parameters:
     *       - name: merchant_id
     *         in: query
     *         required: true
     *         description: Merchant ID dari OkeConnect
     *         schema:
     *           type: string
     *       - name: api_key
     *         in: query
     *         required: true
     *         description: API Key dari OkeConnect
     *         schema:
     *           type: string
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API Key untuk autentikasi RizkyAPI
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan data mutasi QRIS
     *       400:
     *         description: Parameter tidak lengkap
     *       403:
     *         description: API key RizkyAPI tidak valid
     *       500:
     *         description: Terjadi kesalahan saat mengambil data
     */
    fastify.get("/qris/mutasi", { preHandler: validateApiKey }, async (req, reply) => {
        const { merchant_id, api_key } = req.query;

        if (!merchant_id || !api_key) {
            return reply.code(400).send({
                status: "error",
                message: "Parameter 'merchant_id' dan 'api_key' wajib diisi!"
            });
        }

        try {
            const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/${merchant_id}/${api_key}`;
            const response = await axios.get(apiUrl);
            const { data } = response.data;

            let capt = '*Q R I S - M U T A S I*\n\n';
            if (!data || data.length === 0) {
                capt += 'Tidak ada data mutasi.';
            } else {
                data.forEach(entry => {
                    capt += `📅 *Tanggal:* ${entry.date}\n`;
                    capt += `🏦 *Issuer:* ${entry.brand_name}\n`;
                    capt += `💰 *Nominal:* Rp ${entry.amount}\n\n`;
                });
            }

            return reply.code(200).send({ status: "success", message: "Data mutasi QRIS", result: capt });
        } catch (error) {
            console.error("Error checking QRIS status:", error);
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan saat mengambil data mutasi QRIS"
            });
        }
    });
};
