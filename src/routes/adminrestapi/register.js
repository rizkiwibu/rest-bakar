const fs = require("fs");
const nodemailer = require("nodemailer");
const path = require("path");

const akunPath = path.join(__dirname, "../../database/akun.json");
const otpPath = path.join(__dirname, "../../database/otpStore.json");

module.exports = async (fastify) => {
    /**
     * @swagger
     * tags:
     *   name: Admin
     *   description: Endpoint admin untuk autentikasi dan manajemen akun
     */

    /**
     * @swagger
     * /admin/register:
     *   get:
     *     summary: Register akun baru menggunakan Gmail
     *     tags: [Admin]
     *     parameters:
     *       - name: secret
     *         in: query
     *         required: true
     *         description: Secret key autentikasi, hanya untuk admin
     *         schema:
     *           type: string
     *       - name: gmail
     *         in: query
     *         required: true
     *         description: Alamat email Gmail pengguna
     *         schema:
     *           type: string
     *       - name: username
     *         in: query
     *         required: true
     *         description: Nama pengguna untuk akun
     *         schema:
     *           type: string
     *       - name: password
     *         in: query
     *         required: true
     *         description: Password untuk akun pengguna
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: OTP berhasil dikirim
     *       400:
     *         description: Field kosong atau akun sudah ada
     *       403:
     *         description: Secret key salah
     *       500:
     *         description: Gagal mengirim OTP
     */

    fastify.get("/admin/register", async (req, reply) => {
        const { secret, gmail, username, password } = req.query;

        if (secret !== "rizkiganteng17")
            return reply.code(403).send({ status: "error", message: "Secret key tidak valid!" });

        if (!gmail || !username || !password)
            return reply.code(400).send({ status: "error", message: "Semua field wajib diisi!" });

        // Cek apakah email sudah ada di akun.json
        let akunData = {};
        if (fs.existsSync(akunPath)) akunData = JSON.parse(fs.readFileSync(akunPath));
        if (akunData[gmail])
            return reply.code(400).send({ status: "error", message: "Gmail sudah terdaftar!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Kirim OTP via email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "irfanwibu88@gmail.com",
                pass: "iybkumytnqixedyt"
            }
        });

        const mailOptions = {
            from: "irfanwibu88@gmail.com",
            to: gmail,
            subject: "Kode OTP Pendaftaran",
            text: `Kode OTP kamu: ${otp}`
        };

        try {
            await transporter.sendMail(mailOptions);

            // Simpan OTP sementara
            let otpData = {};
            if (fs.existsSync(otpPath)) otpData = JSON.parse(fs.readFileSync(otpPath));
            otpData[gmail] = { otp, username, password, verified: false };
            fs.writeFileSync(otpPath, JSON.stringify(otpData, null, 2));

            return reply.send({ status: "success", message: "OTP telah dikirim ke email!" });
        } catch (err) {
            return reply.code(500).send({ status: "error", message: "Gagal mengirim OTP!", error: err.message });
        }
    });
};
