/**
 * Jadwal Sholat Scraper
 * @author Lang
 * @function jadwalSolat('kota')
 * @function searchCity('query')
 * jgn del wm yh
 */

const axios = require("axios");
const cheerio = require("cheerio");

async function jadwalSolat(kota) {
    try {
        // Normalisasi nama kota (ganti spasi dengan "-", hapus titik, dan ubah ke huruf kecil)
        let formattedCity = kota.toLowerCase().replace(/ /g, "-").replace(/\./g, "");

        let { data } = await axios.get(`https://jadwal-imsakiyah.tirto.id/${formattedCity}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);

        let jadwal = {
            imsak: $("b.font59").eq(0).text().trim() || null,
            subuh: $("b.font59").eq(1).text().trim() || null,
            dzuhur: $("b.font59").eq(2).text().trim() || null,
            ashar: $("b.font59").eq(3).text().trim() || null,
            maghrib: $("b.font59").eq(4).text().trim() || null,
            isya: $("b.font59").eq(5).text().trim() || null,
            all: []
        };

        $(".table-content-sholat").each((i, e) => {
            let tanggal = $(e).find("td").eq(0).text().trim();
            let imsak = $(e).find("td").eq(1).text().trim();
            let subuh = $(e).find("td").eq(2).text().trim();
            let dzuhur = $(e).find("td").eq(3).text().trim();
            let ashar = $(e).find("td").eq(4).text().trim();
            let maghrib = $(e).find("td").eq(5).text().trim();
            let isya = $(e).find("td").eq(6).text().trim();

            if (tanggal) {
                jadwal.all.push({
                    tanggal,
                    jadwal: { imsak, subuh, dzuhur, ashar, maghrib, isya }
                });
            }
        });

        return jadwal;
    } catch (error) {
        return {
            status: "error",
            message: "Gagal mengambil data jadwal sholat",
            error: error.message
        };
    }
}

async function searchCity(q) {
    try {
        let { data } = await axios.get(`https://jadwal-imsakiyah.tirto.id/cities?q=${q}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
            }
        });
        return data;
    } catch (error) {
        return {
            status: "error",
            message: "Gagal mencari kota",
            error: error.message
        };
    }
}

module.exports = { jadwalSolat, searchCity };
