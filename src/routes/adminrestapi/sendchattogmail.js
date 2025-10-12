const nodemailer = require("nodemailer");

module.exports = async (fastify) => {
    /**
     * @swagger
     * /admin/sendchat:
     *   get:
     *     summary: Kirim pesan ke Gmail pengguna
     *     tags: [Admin]
     *     parameters:
     *       - name: secret
     *         in: query
     *         required: true
     *         description: Secret key autentikasi
     *         schema:
     *           type: string
     *       - name: to
     *         in: query
     *         required: true
     *         description: Alamat email penerima
     *         schema:
     *           type: string
     *       - name: message
     *         in: query
     *         required: true
     *         description: Pesan yang akan dikirim
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Pesan berhasil dikirim
     *       400:
     *         description: Field kosong
     *       403:
     *         description: Secret salah
     *       500:
     *         description: Gagal mengirim email
     */
    fastify.get("/admin/sendchat", async (req, reply) => {
        const { secret, to, message } = req.query;

        if (secret !== "rizkiganteng17") {
            return reply.code(403).send({ status: "error", message: "Secret key tidak valid!" });
        }

        if (!to || !message) {
            return reply.code(400).send({ status: "error", message: "Field 'to' dan 'message' wajib diisi!" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "irfanwibu88@gmail.com",
                pass: "iybkumytnqixedyt" // ganti dengan app password Gmail
            }
        });

        const mailOptions = {
            from: "irfanwibu88@gmail.com",
            to,
            subject: "Pesan dari Admin",
            text: message
        };

        try {
            await transporter.sendMail(mailOptions);
            return reply.send({ status: "success", message: "Pesan berhasil dikirim!" });
        } catch (err) {
            return reply.code(500).send({ status: "error", message: "Gagal mengirim email", error: err.message });
        }
    });
};
