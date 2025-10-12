const axios = require("axios");
const cheerio = require("cheerio");

class Otakudesu {
    async latest() {
        try {
            const { data } = await axios.get("https://otakudesu.cloud/");
            const $ = cheerio.load(data);
            const result = [];

            $("div.venutama > div.venz > ul > li").each((i, el) => {
                const link = $(el).find("a").attr("href");
                const gambar = $(el).find("img").attr("src");
                const judul = $(el).find("h2.jdlflm").text().trim();
                const episode = $(el).find("div.epz").first().text().trim();
                const upload = $(el).find("div.epztipe").text().trim();

                result.push({ link, gambar, judul, episode, upload });
            });

            return result;
        } catch (err) {
            throw new Error("Gagal mengambil data anime terbaru.");
        }
    }

    async search(query) {
        try {
            const { data } = await axios.get(`https://otakudesu.cloud/?s=${encodeURIComponent(query)}&post_type=anime`);
            const $ = cheerio.load(data);
            const result = [];

            $("div.venser > div > ul > li").each((i, el) => {
                const link = $(el).find("a").attr("href");
                const gambar = $(el).find("img").attr("src");
                const judul = $(el).find("h2").text().trim();

                result.push({ link, gambar, judul });
            });

            return result;
        } catch (err) {
            throw new Error("Gagal mencari anime.");
        }
    }

    async detail(url) {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            const judul = $("div.venser > div.jdlrx").text().trim();
            const gambar = $("div.venser > div.fotoanime > img").attr("src");
            const sinopsis = $("div.sinopc").text().trim();

            const info = {};
            $("div.infozingle > p").each((i, el) => {
                const [key, ...val] = $(el).text().split(": ");
                info[key.toLowerCase().replace(/\s+/g, "_")] = val.join(": ").trim();
            });

            const episode_list = [];
            $("div.episodelist > ul > li").each((i, el) => {
                const nama = $(el).find("span.lchx").text().trim();
                const link = $(el).find("a").attr("href");
                episode_list.push({ nama, link });
            });

            return { judul, gambar, sinopsis, info, episode_list };
        } catch (err) {
            throw new Error("Gagal mengambil detail anime.");
        }
    }

    async quotes() {
        try {
            const page = Math.floor(Math.random() * 184);
            const { data } = await axios.get("https://otakotaku.com/quote/feed/" + page);
            const $ = cheerio.load(data);
            const result = [];

            $("div.kotodama-list").each((i, el) => {
                result.push({
                    link: $(el).find("a").attr("href"),
                    gambar: $(el).find("img").attr("data-src"),
                    karakter: $(el).find("div.char-name").text().trim(),
                    anime: $(el).find("div.anime-title").text().trim(),
                    episode: $(el).find("div.meta").text().trim(),
                    up_at: $(el).find("small.meta").text().trim(),
                    quotes: $(el).find("div.quote").text().trim(),
                });
            });

            return result;
        } catch (err) {
            throw new Error("Gagal mengambil data quotes.");
        }
    }
}

module.exports = Otakudesu;
