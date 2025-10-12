const { fetch } = require("undici");
const cheerio = require("cheerio");

/**
 * Scraper untuk Nekopoi
 */
class NekoPoi {
    async latest() {
        const res = await fetch("https://nekopoi.care");
        const html = await res.text();
        const $ = cheerio.load(html);

        let series = [];
        let episode = [];

        $(".animeseries ul li").each((_, i) => {
            let title = $(i).find("a").attr("original-title");
            let exec = cheerio.load(title);
            let info = {};

            exec(".areadetail p").each((_, oh) => {
                let name = exec(oh).find("b").text().trim();
                let key = exec(oh).text().replace(name + ":", "").trim();
                info[name.split(" ").join("_").toLowerCase()] = key;
            });

            series.push({
                title: exec(".infoarea h2").eq(0).text(),
                thumbnail: exec(".areabaru img").attr("src"),
                ...info,
                url: $(i).find("a").attr("href"),
            });
        });

        $("#boxid .eropost").each((_, i) => {
            episode.push({
                title: $(i).find(".eroinfo h2 a").text().trim(),
                release: $(i).find(".eroinfo span").eq(0).text().trim(),
                url: $(i).find(".eroinfo h2 a").attr("href"),
            });
        });

        return { series, episode };
    }

    async detail(url) {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        let result = { metadata: {}, episode: [] };

        $(".animeinfos .listinfo ul li").each((_, i) => {
            let name = $(i).find("b").text().trim();
            let key = $(i).text().trim().replace(name + ":", "").trim();
            result.metadata[name.toLowerCase()] = key;
        });

        result.metadata.thumbnail = $(".animeinfos .imgdesc img").attr("src");
        result.metadata.sinopsis = $(".animeinfos p").text();

        $(".animeinfos .episodelist ul li").each((_, i) => {
            result.episode.push({
                title: $(i).find("span").eq(0).find("a").text().trim(),
                release: $(i).find("span").eq(1).text().trim(),
                url: $(i).find("span").eq(0).find("a").attr("href"),
            });
        });

        return result;
    }

    async episode(url) {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        let result = { metadata: {}, download: [] };

        $(".contentpost").each((_, el) => {
            result.metadata.title = $(el).find("img").attr("title");
            result.metadata.images = $(el).find("img").attr("src");
            result.metadata.synopsis = $(el)
                .find(".konten")
                .find("p:nth-of-type(2)")
                .text();
        });

        result.metadata.stream = $("#show-stream").find("#stream1 iframe").attr("src");

        $(".liner").each((_, el) => {
            let name = $(el).find(".name").text();
            let links = [];

            $(el)
                .find(".listlink a")
                .each((_, link) => {
                    links.push({
                        name: $(link).text().trim(),
                        url: $(link).attr("href"),
                    });
                });

            result.download.push({
                title: name,
                source: links,
            });
        });

        return result;
    }

    async search(query) {
        const res = await fetch(`https://nekopoi.care/?s=${query}`);
        const html = await res.text();
        const $ = cheerio.load(html);

        let results = [];

        $(".result ul li").each((_, el) => {
            let link = $(el).find("h2 a").attr("href");
            results.push({
                title: $(el).find("h2 a").text().trim(),
                type: link.includes("/hentai/") ? "Hentai Series" : "Hentai Episodes",
                images: $(el).find("img").attr("src"),
                url: link,
            });
        });

        return results;
    }
}

module.exports = new NekoPoi();
