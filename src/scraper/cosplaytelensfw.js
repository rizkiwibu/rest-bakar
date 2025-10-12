const axios = require("axios");
const cheerio = require("cheerio");

/**
 * CosplayTele (Latest, Search, and Detail)
 * wm by natsumiworld / ty: yungkathmymusicfavoriteguwa.
 */
class CosplayTele {
    constructor(baseUrl = "https://cosplaytele.com") {
        this.BASE_URL = baseUrl;
    }

    async #extract(url) {
        try {
            const { data } = await axios.get(url);
            return cheerio.load(data);
        } catch (error) {
            console.error("Request failed:", error.message);
            return null;
        }
    }

    async latest(page = 1) {
        const $ = await this.#extract(`${this.BASE_URL}/page/${page}/`);
        if (!$) return [];

        const results = [];

        $(".col.post-item").each((_, el) => {
            const $el = $(el);
            results.push({
                title: $el.find(".post-title a").text().trim(),
                url: $el.find(".post-title a").attr("href"),
                image: $el.find("img").attr("src"),
                excerpt: $el.find(".from_the_blog_excerpt").text().trim(),
            });
        });

        return results;
    }

    async search(query) {
        const $ = await this.#extract(
            `${this.BASE_URL}/?s=${encodeURIComponent(query)}`
        );
        if (!$) return [];

        const results = [];

        $(".col.post-item").each((_, el) => {
            const $el = $(el);
            results.push({
                title: $el.find(".post-title a").text().trim(),
                url: $el.find(".post-title a").attr("href"),
                image: $el.find("img").attr("src"),
                excerpt: $el.find(".from_the_blog_excerpt").text().trim(),
            });
        });

        return results;
    }

    async detail(url) {
        const $ = await this.#extract(url);
        if (!$) return null;

        const detail = {
            title: $("h1").text().trim(),
            images: [],
            videos: [],
            details: {},
        };

        $(".entry-content img").each((_, el) => {
            const src = $(el).attr("src");
            if (src) detail.images.push(src);
        });

        $('iframe[src*="youtube"], iframe[src*="vimeo"]').each((_, el) => {
            detail.videos.push($(el).attr("src"));
        });

        const excerpt = $(".from_the_blog_excerpt").text().trim();
        const detailsMap = {
            "Cosplayer:": "cosplayer",
            "Character:": "character",
            "Appear In:": "appearance",
            "Photos:": "photos",
            "File Size:": "fileSize",
            "Unzip Password:": "password",
        };

        excerpt.split("\n").forEach((line) => {
            const [keyPart, ...valueParts] = line.split(":");
            const key = detailsMap[keyPart.trim()];
            if (key) {
                detail.details[key] = valueParts.join(":").trim();
            }
        });

        return detail;
    }
}

// Usage example:
const crot = new CosplayTele();
crot.latest().then(console.log);
// crot.search('genshin').then(console.log);
// crot.detail('https://cosplaytele.com/lumine/').then(console.log);

module.exports = CosplayTele;
