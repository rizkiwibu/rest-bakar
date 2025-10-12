const validateApiKey = require("../../middlewares/validateApiKey");
const QRCode = require("qrcode");

/**
 * @swagger
 * tags:
 *   name: QRIS
 *   description: Generate QRIS dengan nominal tertentu
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /qris/generate:
     *   get:
     *     summary: Generate QRIS dengan nominal tertentu (langsung kirim gambar)
     *     tags: [QRIS]
     *     parameters:
     *       - name: qris
     *         in: query
     *         required: true
     *         description: QRIS statis dari pengguna
     *         schema:
     *           type: string
     *       - name: nominal
     *         in: query
     *         required: true
     *         description: Nominal transaksi
     *         schema:
     *           type: integer
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil menghasilkan QRIS dengan nominal tertentu
     *         content:
     *           image/png:
     *             schema:
     *               type: string
     *               format: binary
     *       400:
     *         description: Input tidak valid
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */

    function ConvertCRC16(str) {
        let crc = 0xFFFF;
        for (let i = 0; i < str.length; i++) {
            crc ^= str.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
    }

    fastify.get("/qris/generate", { preHandler: validateApiKey }, async (req, reply) => {
        try {
            const { qris, nominal } = req.query;

            // Validasi parameter
            const parsedNominal = Number(nominal);
            if (!qris || isNaN(parsedNominal) || parsedNominal < 1 || !Number.isInteger(parsedNominal)) {
                return reply.code(400).send({
                    status: "error",
                    message: "Parameter qris harus berupa string, dan nominal harus bilangan bulat positif!"
                });
            }

            // Proses QRIS
            let qrisData = qris.slice(0, -4).replace("010211", "010212");
            let splitQRIS = qrisData.split("5802ID");

            if (splitQRIS.length < 2) {
                return reply.code(400).send({
                    status: "error",
                    message: "Format QRIS tidak valid!"
                });
            }

            let nominalStr = `54${parsedNominal.toString().length.toString().padStart(2, "0")}${parsedNominal}5802ID`;
            let finalQRIS = splitQRIS[0].trim() + nominalStr + splitQRIS[1].trim();
            finalQRIS += ConvertCRC16(finalQRIS);

            // Generate QR Code dari finalQRIS
            const qrBuffer = await QRCode.toBuffer(finalQRIS, { scale: 10 });

            // Kirim buffer sebagai response image/png
            reply
                .type("image/png")
                .header("Content-Disposition", 'inline; filename="qris.png"')
                .send(qrBuffer);

        } catch (error) {
            console.error("Error generating QRIS:", error);
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan dalam pembuatan QRIS!"
            });
        }
    });
};
