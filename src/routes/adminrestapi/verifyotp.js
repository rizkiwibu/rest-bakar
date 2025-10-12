const fs = require("fs");
const path = require("path");

const otpPath = path.join(__dirname, "../../database/otpStore.json");
const akunPath = path.join(__dirname, "../../database/akun.json");

module.exports = async (fastify) => {
    /**
     * @swagger
     * /admin/verifyotp:
     *   get:
     *     summary: Verifikasi OTP yang dikirim ke email
     *     tags: [Admin]
     *     parameters:
     *       - name: secret
     *         in: query
     *         required: true
     *         description: Secret key autentikasi admin
     *         schema:
     *           type: string
     *       - name: gmail
     *         in: query
     *         required: true
     *         description: Alamat email Gmail pengguna
     *         schema:
     *           type: string
     *       - name: otp
     *         in: query
     *         required: true
     *         description: OTP yang dikirimkan ke email
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: OTP berhasil diverifikasi
     *       400:
     *         description: OTP tidak valid atau data kurang
     *       403:
     *         description: Secret key salah
     *       404:
     *         description: OTP tidak ditemukan
     */
    fastify.get("/admin/verifyotp", async (req, reply) => {
        const { secret, gmail, otp } = req.query;
        const SECRET_KEY = "rizkiganteng17";

        if (secret !== SECRET_KEY) {
            return reply.code(403).send({
                status: "error",
                message: "Secret key tidak valid!"
            });
        }

        if (!gmail || !otp) {
            return reply.code(400).send({
                status: "error",
                message: "Semua field wajib diisi!"
            });
        }

        let otpData = {};
        if (fs.existsSync(otpPath)) {
            otpData = JSON.parse(fs.readFileSync(otpPath));
        }

        if (!otpData[gmail]) {
            return reply.code(404).send({
                status: "error",
                message: "OTP tidak ditemukan untuk email tersebut!"
            });
        }

        if (otpData[gmail].otp !== otp) {
            return reply.code(400).send({
                status: "error",
                message: "OTP tidak valid!"
            });
        }

        // Set verifikasi true
        otpData[gmail].verified = true;
        fs.writeFileSync(otpPath, JSON.stringify(otpData, null, 2));

        // Simpan ke akun.json
        let akunData = {};
        if (fs.existsSync(akunPath)) {
            akunData = JSON.parse(fs.readFileSync(akunPath));
        }

        if (!akunData[gmail]) {
            akunData[gmail] = {
                username: otpData[gmail].username,
                password: otpData[gmail].password,
                verified: true
            };
        } else {
            akunData[gmail].verified = true;
        }

        fs.writeFileSync(akunPath, JSON.stringify(akunData, null, 2));

        return reply.send({
            status: "success",
            message: "OTP berhasil diverifikasi dan akun diaktifkan!"
        });
    });
};
