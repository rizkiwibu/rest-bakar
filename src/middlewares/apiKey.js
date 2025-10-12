const fs = require("fs");
const path = require("path");

// Path ke file key.json yang dipindahkan ke /root/key.json
const keyPath = path.join(__dirname, "../../key.json");  // Path baru ke /root/key.json

const getApiKey = () => {
    try {
        // Baca file key.json
        const rawData = fs.readFileSync(keyPath);
        const { apikey } = JSON.parse(rawData); // Ambil apikey dari file
        return apikey;
    } catch (error) {
        throw new Error("Terjadi kesalahan saat membaca key.json");
    }
};

module.exports = getApiKey;
