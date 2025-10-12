const validateApiKey = require("../../middlewares/validateApiKey");
const fetch = require("node-fetch");

/**
 * @swagger
 * tags:
 *   name: YTDL v2
 *   description: Download YouTube via ytmp3.mobi (mp3/mp4)
 */

module.exports = async (fastify) => {
  /**
   * @swagger
   * /ytdownv2:
   *   get:
   *     summary: Download YouTube via ytmp3.mobi
   *     tags: [YTDL v2]
   *     parameters:
   *       - name: url
   *         in: query
   *         required: true
   *         description: Link YouTube
   *         schema:
   *           type: string
   *       - name: format
   *         in: query
   *         required: false
   *         description: "Format unduhan mp3/mp4, default: mp3"
   *         schema:
   *           type: string
   *           enum: [mp3, mp4]
   *       - name: apikey
   *         in: query
   *         required: true
   *         description: API key untuk autentikasi
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Berhasil mendapatkan link download
   *       400:
   *         description: Parameter tidak valid
   *       403:
   *         description: API key tidak valid
   *       500:
   *         description: Terjadi kesalahan server
   */
  fastify.get("/ytdownv2", { preHandler: validateApiKey }, async (req, reply) => {
    const { url, format = "mp3" } = req.query;

    if (!url) {
      return reply.code(400).send({
        status: "error",
        message: "Parameter 'url' tidak boleh kosong!"
      });
    }

    if (!["mp3", "mp4"].includes(format)) {
      return reply.code(400).send({
        status: "error",
        message: "Format hanya boleh 'mp3' atau 'mp4'"
      });
    }

    try {
      const ytmp3mobi = async (youtubeUrl, format) => {
        const regYoutubeId = /https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|www\.youtube\.com\/shorts\/)([^&|^?]+)/;
        const videoId = youtubeUrl.match(regYoutubeId);

        if (!videoId) throw Error("Gagal mengekstrak video ID dari URL YouTube.");

        const urlParam = {
          v: videoId[2],
          f: format,
          _: Math.random()
        };

        const headers = {
          "Referer": "https://id.ytmp3.mobi/"
        };

        const fetchJson = async (url, desc) => {
          const res = await fetch(url, { headers });
          if (!res.ok) throw Error(`Gagal mengambil data (${desc}): ${res.status}`);
          return await res.json();
        };

        const { convertURL } = await fetchJson("https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=" + Math.random(), "init");
        const { progressURL, downloadURL } = await fetchJson(`${convertURL}&${new URLSearchParams(urlParam).toString()}`, "convert");

        let progress, error, title;
        while (progress !== 3) {
          ({ progress, error, title } = await fetchJson(progressURL, "progress"));
          if (error) throw Error(`Gagal: ${error}`);
        }

        return { title, downloadURL };
      };

      const result = await ytmp3mobi(url, format);

      return reply.send({
        status: "success",
        title: result.title,
        format,
        download: result.downloadURL
      });

    } catch (err) {
      return reply.code(500).send({
        status: "error",
        message: err.message
      });
    }
  });
};
