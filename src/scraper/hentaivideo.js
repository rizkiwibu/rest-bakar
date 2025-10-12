const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function getHentaiList() {
    const page = Math.floor(Math.random() * 1153);
    const response = await fetch(`https://sfmcompile.club/page/${page}`);
    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);

    const hasil = [];
    $("#primary > div > div > ul > li > article").each(function (a, b) {
        hasil.push({
            title: $(b).find("header > h2").text().trim(),
            link: $(b).find("header > h2 > a").attr("href"),
            category: $(b)
                .find("header > div.entry-before-title > span > span")
                .text()
                .replace("in ", "")
                .trim(),
            share_count: $(b)
                .find("header > div.entry-after-title > p > span.entry-shares")
                .text()
                .trim(),
            views_count: $(b)
                .find("header > div.entry-after-title > p > span.entry-views")
                .text()
                .trim(),
            type: $(b).find("source").attr("type") || "image/jpeg",
            video_1:
                $(b).find("source").attr("src") || $(b).find("img").attr("data-src"),
            video_2: $(b).find("video > a").attr("href") || "",
        });
    });

    return hasil;
}

module.exports = { getHentaiList };
