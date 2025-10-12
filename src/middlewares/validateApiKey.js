const fs = require("fs");
const path = require("path");

// Path ke key.json
const keyFilePath = path.join(__dirname, "../../key.json");

// Simpan penggunaan API key dalam memori
const usageLimits = {}; // Format: { "apikey": { count, limit } }

// Fungsi untuk membaca key.json
const readApiKeys = () => {
    if (!fs.existsSync(keyFilePath)) {
        console.error(`File key.json tidak ditemukan di ${keyFilePath}`);
        return {};
    }

    try {
        return JSON.parse(fs.readFileSync(keyFilePath, "utf-8"));
    } catch (error) {
        console.error("Gagal membaca atau memparsing key.json", error);
        return {};
    }
};

// Middleware validasi API key
module.exports = async (req, reply, done) => {
    try {
        const apiKey = req.query.apikey; // Ambil API key dari query parameter

        // Jika tidak ada API key dalam query, kirim error 403
        if (!apiKey) {
            return reply.code(403).send({
                status: "error",
                message: "API key tidak ditemukan",
            });
        }

        // Baca API keys dari key.json
        const apiKeys = readApiKeys();

        // Cek apakah API key valid
        const keyData = apiKeys[apiKey];
        if (!keyData) {
            return reply.code(403).send({
                status: "error",
                message: "API key tidak valid",
            });
        }

        // Ambil limit berdasarkan jenis API key
        const limit = keyData.limit || 100; // Default limit 100 jika tidak ada di key.json

        // Inisialisasi penggunaan API key jika belum ada
        if (!usageLimits[apiKey]) {
            usageLimits[apiKey] = { count: 0, limit };
        }

        // Jika sudah mencapai limit, tolak request
        if (usageLimits[apiKey].count >= limit) {
            return reply.code(429).send({
                status: "error",
                message: "Limit API key telah habis!",
            });
        }

        // Tambahkan penggunaan API key
        usageLimits[apiKey].count += 1;

        // Lanjutkan ke handler berikutnya
        done();
    } catch (error) {
        return reply.code(500).send({
            status: "error",
            message: `Terjadi kesalahan saat memvalidasi API key: ${error.message}`,
        });
    }
};
