const lk21 = require("../../scraper/lk21"); // Import scraper
const validateApiKey = require("../../middlewares/validateApiKey"); // Middleware API key

/**
 * @swagger
 * tags:
 *   name: LK21
 *   description: Fitur untuk mencari dan mendapatkan detail film dari LK21
 */

module.exports = async (fastify) => {
  /**
   * @swagger
   * /lk21/search:
   *   get:
   *     summary: Cari film dari LK21 berdasarkan judul
   *     tags: [LK21]
   *     parameters:
   *       - name: query
   *         in: query
   *         required: true
   *         description: Judul film yang ingin dicari
   *         schema:
   *           type: string
   *       - name: apikey
   *         in: query
   *         required: true
   *         description: API key untuk autentikasi
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Berhasil mendapatkan daftar film
   *       400:
   *         description: Query tidak boleh kosong
   *       403:
   *         description: API key tidak valid
   *       500:
   *         description: Terjadi kesalahan server
   */
  fastify.get("/lk21/search", { preHandler: validateApiKey }, async (req, reply) => {
    const { query } = req.query;

    if (!query) {
      return reply.code(400).send({
        status: "error",
        message: "Query tidak boleh kosong!",
      });
    }

    const result = await lk21.lk21.search(query);
    return reply.code(result.code).send(result);
  });

  /**
   * @swagger
   * /lk21/details:
   *   get:
   *     summary: Dapatkan detail film dari LK21 berdasarkan URL
   *     tags: [LK21]
   *     parameters:
   *       - name: url
   *         in: query
   *         required: true
   *         description: URL halaman film di LK21
   *         schema:
   *           type: string
   *       - name: apikey
   *         in: query
   *         required: true
   *         description: API key untuk autentikasi
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Berhasil mendapatkan detail film
   *       400:
   *         description: URL tidak valid
   *       403:
   *         description: API key tidak valid
   *       500:
   *         description: Terjadi kesalahan server
   */
  fastify.get("/lk21/details", { preHandler: validateApiKey }, async (req, reply) => {
    const { url } = req.query;

    if (!url) {
      return reply.code(400).send({
        status: "error",
        message: "URL tidak boleh kosong!",
      });
    }

    const result = await lk21.lk21.details(url);
    return reply.code(result.code).send(result);
  });
};
