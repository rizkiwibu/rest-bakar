const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const pixiv = {
    api: {
        base: "https://www.pixiv.net",
        endpoints: {
            search: "/ajax/search/artworks/",
            illust: "/ajax/illust/"
        },
        proxy: "https://api.xiaomiao-ica.top/agent/index.php",
        upload: "https://catbox.moe/user/api.php"
    },

    headers: {
        accept: "application/json",
        referer: "https://www.pixiv.net/",
        "user-agent": "Postify/1.0.0",
        "x-requested-with": "XMLHttpRequest"
    },

    defaults: {
        useProxy: true,
        useCatbox: false,
        useBuffer: false,
        outputType: "url",
        deleteAfterUpload: true,
        cookie: null
    },

    orderTypes: {
        date_d: "Terbaru ke Terlama",
        date: "Terlama ke Terbaru",
        popular_d: "Populer Hari Ini",
        popular_male_d: "Populer dari Laki-laki",
        popular_female_d: "Populer dari Perempuan"
    },

    isOrder(order) {
        return Object.keys(this.orderTypes).includes(order);
    },

    getOrder() {
        return Object.entries(this.orderTypes).map(([type, description]) => ({ type, description }));
    },

    isUrl(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    },

    isPix(url) {
        if (!url) return false;
        const regexes = [
            /^https?:\/\/(?:www\.)?pixiv\.net\/(?:en\/)?artworks\/\d+/,
            /^https?:\/\/(?:www\.)?pixiv\.net\/(?:\w{2}\/)?artworks\/\d+/,
            /^https?:\/\/(?:www\.)?pixiv\.net\/(?:en\/)?users\/\d+/,
            /^https?:\/\/(?:www\.)?pixiv\.net\/member\.php\?id=\d+/,
            /^https?:\/\/(?:www\.)?pixiv\.net\/(?:en\/)?tags\/.*?\/artworks/,
            /^https?:\/\/i\.pximg\.net\/img-.*?\/img\/.*?\/\d+_p\d+\.\w+$/
        ];
        return regexes.some((regex) => regex.test(url.trim().toLowerCase()));
    },

    tipex(url) {
        if (!url) return null;
        const types = {
            artwork: /artworks\/\d+/,
            user: /users\/\d+|member\.php\?id=\d+/,
            tag: /tags\/.*?\/artworks/,
            direct: /i\.pximg\.net\/img-.*?\/img/
        };
        return Object.entries(types).find(([_, regex]) => regex.test(url))?.[0] || null;
    },

    desc(c) {
        return c ? c.replace(/<[^>]*>/g, "").replace(/https?:\/\/[^\s]+/g, "").replace(/&[^;]+;/g, "").trim() : "";
    },

    async getCookies(kukis = null) {
        try {
            if (kukis) return kukis;
            const response = await axios.get(this.api.base);
            const setHeaders = response.headers["set-cookie"];
            return setHeaders ? setHeaders.map((cookie) => cookie.split(";")[0].trim()).join("; ") : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    proxies(url) {
        return `${this.api.proxy}?dns=8.8.8.8&fileUrl=${encodeURIComponent(url)}&referer=https://www.pixiv.net`;
    },

    async up2Catbox(filepath) {
        try {
            const formData = new FormData();
            formData.append("reqtype", "fileupload");
            formData.append("fileToUpload", fs.createReadStream(filepath));

            const response = await axios.post(this.api.upload, formData, { headers: { ...formData.getHeaders() } });
            return response.data;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async imagesx(url, options = {}) {
        const opt = { ...this.defaults, ...options };
        const dlink = opt.useProxy ? this.proxies(url) : url;
        const headers = opt.useProxy ? {} : { Referer: "https://www.pixiv.net/" };

        const response = await axios.get(dlink, { responseType: "arraybuffer", headers });
        const buffer = Buffer.from(response.data, "binary");
        const filename = path.basename(url);
        const result = { original: url };

        if (opt.useProxy) result.proxy = dlink;
        if (opt.useBuffer) result.buffer = buffer;

        if (opt.useCatbox) {
            const filepath = path.join(options.directory || "Downloads", filename);
            fs.writeFileSync(filepath, buffer);
            result.catbox = await this.up2Catbox(filepath);
            if (opt.deleteAfterUpload) fs.unlinkSync(filepath);
        }

        result.mime = response.headers["content-type"];
        result.size = buffer.length;
        return result;
    },

    async search(query, options = {}) {
        if (!query) {
            return { status: false, code: 400, result: { error: "Query tidak boleh kosong" } };
        }

        if (options.order && !this.isOrder(options.order)) {
            return { status: false, code: 400, result: { error: "Order type tidak valid", valid_orders: this.getOrder() } };
        }

        try {
            const cookies = await this.getCookies(options.cookie);
            if (!cookies) return { status: false, code: 400, result: { error: "Cookie tidak ditemukan" } };

            const page = options.page || 1;
            const params = {
                word: query,
                order: options.order || "date_d",
                mode: "all",
                p: page,
                s_mode: "s_tag_full",
                type: "all",
                lang: "en"
            };

            const { data } = await axios.get(`${this.api.base}${this.api.endpoints.search}${encodeURIComponent(query)}`, {
                headers: { ...this.headers, cookie: cookies },
                params
            });

            if (!data.body?.illustManga?.data) {
                return { status: false, code: 404, result: { error: `Tidak ditemukan untuk keyword: ${query}` } };
            }

            return {
                status: true,
                code: 200,
                result: {
                    query,
                    page,
                    order: { type: params.order, description: this.orderTypes[params.order] },
                    artworks: data.body.illustManga.data.slice(0, options.limit || 20)
                }
            };
        } catch (error) {
            return { status: false, code: error.response?.status || 500, result: { error: "Terjadi kesalahan saat mengambil data" } };
        }
    },

    async download(url, options = {}) {
        if (!url || !this.isUrl(url) || !this.isPix(url)) {
            return { status: false, code: 400, result: { error: "URL tidak valid atau bukan dari Pixiv" } };
        }

        try {
            const illustId = url.match(/\d+/)[0];
            const cookies = await this.getCookies(options.cookie);
            if (!cookies) return { status: false, code: 400, result: { error: "Cookie tidak ditemukan" } };

            const { data } = await axios.get(`${this.api.base}${this.api.endpoints.illust}${illustId}`, { headers: { ...this.headers, cookie: cookies } });

            if (!data.body) {
                return { status: false, code: 404, result: { error: "Artwork tidak ditemukan" } };
            }

            return { status: true, code: 200, result: data.body };
        } catch (error) {
            return { status: false, code: error.response?.status || 500, result: { error: "Gagal mengambil data" } };
        }
    }
};

module.exports = pixiv;
