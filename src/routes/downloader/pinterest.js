const validateApiKey = require("../../middlewares/validateApiKey");
const axios = require("axios");
const https = require("https");
const qs = require("qs");

/**
 * @swagger
 * tags:
 *   name: Pinterest
 *   description: Fitur pencarian dan unduhan media dari Pinterest
 */

// Scraper: Pinterest Search
async function pinterestSearch(query) {
  const agent = new https.Agent({ keepAlive: true });

  try {
    const home = await axios.get("https://www.pinterest.com/", {
      httpsAgent: agent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const raw = home.headers["set-cookie"] || [];
    const cookies = raw.map((c) => c.split(";")[0]).join("; ");
    const csrf =
      (raw.find((c) => c.startsWith("csrftoken=")) || "")
        .split("=")[1]
        ?.split(";")[0] || "";

    const source_url = `/search/pins/?q=${encodeURIComponent(query)}`;
    const data = {
      options: {
        query,
        field_set_key: "react_grid_pin",
        is_prefetch: false,
        page_size: 25,
      },
      context: {},
    };
    const body = qs.stringify({ source_url, data: JSON.stringify(data) });

    const res = await axios.post(
      "https://www.pinterest.com/resource/BaseSearchResource/get/",
      body,
      {
        httpsAgent: agent,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRFToken": csrf,
          "X-Requested-With": "XMLHttpRequest",
          Origin: "https://www.pinterest.com",
          Referer: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
          Cookie: cookies,
        },
      }
    );

    const pins = res.data.resource_response.data.results
      .slice(0, 25)
      .map((p) => ({
        link: `https://www.pinterest.com/pin/${p.id}/`,
        directLink: p.images?.orig?.url || p.images?.["236x"]?.url,
      }));

    return {
      success: true,
      results: pins,
    };
  } catch (e) {
    return {
      success: false,
      error: e.message,
    };
  }
}

// Scraper: Pinterest Downloader
async function pinterestDownload(url) {
  try {
    if (!url) throw "missing url!";

    const raw = await axios.get(
      `https://pinterestdownloader.io/frontendService/DownloaderService?url=${url}`,
      {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Origin: "https://pinterestdownloader.io",
          Referer: "https://pinterestdownloader.io/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        },
      }
    );

    const data = raw.data;
    if (!data?.medias) throw "failed fetching media!";

    const originalsSet = new Set();
    const mediaList = [];

    for (const media of data.medias) {
      mediaList.push(media);

      if (media.extension === "jpg" && media.url.includes("i.pinimg.com/")) {
        const originalUrl = media.url.replace(/\/\d+x\//, "/originals/");
        if (!originalsSet.has(originalUrl)) {
          originalsSet.add(originalUrl);
          mediaList.push({
            ...media,
            url: originalUrl,
            quality: "original",
          });
        }
      }
    }

    return {
      success: true,
      media: mediaList.sort((a, b) => (b.size || 0) - (a.size || 0)),
    };
  } catch (e) {
    return {
      success: false,
      error: e.toString(),
    };
  }
}

module.exports = async (fastify) => {
  /**
   * @swagger
   * /pinterest/search:
   *   get:
   *     summary: Cari gambar dari Pinterest
   *     tags: [Pinterest]
   *     parameters:
   *       - name: query
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: Kata kunci pencarian
   *       - name: apikey
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: API key untuk autentikasi
   *     responses:
   *       200:
   *         description: Berhasil mendapatkan hasil
   *       400:
   *         description: Query tidak boleh kosong
   *       500:
   *         description: Gagal scraping data
   */
  fastify.get("/pinterest/search", { preHandler: validateApiKey }, async (req, reply) => {
    const { query } = req.query;
    if (!query) {
      return reply.code(400).send({
        status: "error",
        message: "Parameter 'query' tidak boleh kosong!",
      });
    }

    const result = await pinterestSearch(query);
    if (!result.success) {
      return reply.code(500).send({
        status: "error",
        message: result.error,
      });
    }

    return reply.send({
      status: "success",
      result: result.results,
    });
  });

  /**
   * @swagger
   * /pinterest/download:
   *   get:
   *     summary: Unduh media dari URL Pinterest
   *     tags: [Pinterest]
   *     parameters:
   *       - name: url
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: URL pin dari Pinterest
   *       - name: apikey
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: API key untuk autentikasi
   *     responses:
   *       200:
   *         description: Berhasil mendapatkan media
   *       400:
   *         description: URL tidak boleh kosong
   *       500:
   *         description: Gagal scraping media
   */
  fastify.get("/pinterest/download", { preHandler: validateApiKey }, async (req, reply) => {
    const { url } = req.query;
    if (!url) {
      return reply.code(400).send({
        status: "error",
        message: "Parameter 'url' tidak boleh kosong!",
      });
    }

    const result = await pinterestDownload(url);
    if (!result.success) {
      return reply.code(500).send({
        status: "error",
        message: result.error,
      });
    }

    return reply.send({
      status: "success",
      result: result.media,
    });
  });
};
