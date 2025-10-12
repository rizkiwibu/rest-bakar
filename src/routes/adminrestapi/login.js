const fs = require("fs");
const path = require("path");

const akunPath = path.join(__dirname, "../../database/akun.json");

module.exports = async (fastify) => {
    /**
     * @swagger
     * tags:
     *   name: Admin
     *   description: Endpoint admin untuk autentikasi dan manajemen akun
     */

    /**
     * @swagger
     * /admin/login:
     *   get:
     *     summary: Login pengguna dengan Gmail dan password
     *     tags: [Admin]
     *     parameters:
     *       - name: secret
     *         in: query
     *         required: true
     *         description: "Secret key autentikasi, hanya untuk admin"
     *         schema:
     *           type: string
     *       - name: gmail
     *         in: query
     *         required: true
     *         description: "Alamat email Gmail pengguna"
     *         schema:
     *           type: string
     *       - name: password
     *         in: query
     *         required: true
     *         description: "Password pengguna"
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Login berhasil
     *       400:
     *         description: "Gmail dan password harus diisi!"
     *       404:
     *         description: Akun tidak ditemukan
     *       401:
     *         description: Password tidak valid
     *       403:
     *         description: Secret key tidak valid
     *       500:
     *         description: Gagal memverifikasi login
     */
    fastify.get("/admin/login", async (req, reply) => {
        const { secret } = req.query;
        const { gmail, password } = req.query;

        // Validasi secret key
        const SECRET_KEY = "rizkiganteng17"; // Secret key yang valid

        if (secret !== SECRET_KEY) {
            return reply.code(403).send({ status: "error", message: "Secret key tidak valid!" });
        }

        // Validasi input
        if (!gmail || !password) {
            return reply.code(400).send({ status: "error", message: "Gmail dan password harus diisi!" });
        }

        // Cek data akun yang tersimpan
        let akunData = {};
        if (fs.existsSync(akunPath)) {
            akunData = JSON.parse(fs.readFileSync(akunPath));
        }

        // Cek apakah akun ditemukan
        if (!akunData[gmail]) {
            return reply.code(404).send({ status: "error", message: "Akun tidak ditemukan!" });
        }

        // Cek password yang sesuai
        if (akunData[gmail].password !== password) {
            return reply.code(401).send({ status: "error", message: "Password tidak valid!" });
        }

        // Login berhasil
        return reply.send({ status: "success", message: "Login berhasil!" });
    });
};
