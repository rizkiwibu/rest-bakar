const fetch = require("node-fetch");

/**
 * @swagger
 * tags:
 *   name: TikTok
 *   description: Mengunduh video TikTok dengan URL
 */

module.exports = async (fastify) => {
  /**
   * @swagger
   * /downloader/tiktok:
   *   get:
   *     summary: Mengunduh video TikTok berdasarkan URL
   *     tags: [TikTok]
   *     parameters:
   *       - name: url
   *         in: query
   *         required: true
   *         description: URL video TikTok yang ingin diunduh
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Berhasil mendapatkan data video TikTok
   *       400:
   *         description: URL tidak valid
   *       500:
   *         description: Terjadi kesalahan server
   */
  fastify.get("/downloader/tiktok", async (req, reply) => {
    const { url } = req.query;

    if (!url) {
      return reply.code(400).send({
        status: "error",
        message: "URL tidak boleh kosong!"
      });
    }

    try {
      const response = await fetch(`https://tikwm.com/api/?url=${url}`);
      const data = await response.json();

      if (data.code === 0) {
        return reply.code(200).send({
          status: "success",
          message: "Video berhasil diunduh",
          data: {
            title: data.data.title,
            cover: data.data.cover,
            play_url: data.data.play,
            music_info: data.data.music_info
          }
        });
      } else {
        return reply.code(500).send({
          status: "error",
          message: "Gagal mendapatkan data video TikTok"
        });
      }
    } catch (error) {
      return reply.code(500).send({
        status: "error",
        message: "Terjadi kesalahan saat memproses permintaan"
      });
    }
  });
};
