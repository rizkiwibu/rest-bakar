const fs = require("fs");
const path = require("path");

/**
 * @swagger
 * tags:
 *   name: AdminAPIKey
 *   description: Endpoint admin untuk mengelola API Key (GET only)
 */

module.exports = async (fastify) => {
  const keyFilePath = path.join(process.cwd(), "key.json");

  /**
   * @swagger
   * /admin/addkey:
   *   get:
   *     summary: Menambahkan API Key baru (admin only)
   *     tags: [AdminAPIKey]
   *     parameters:
   *       - name: apikey
   *         in: query
   *         required: true
   *         description: API key yang ingin ditambahkan
   *         schema:
   *           type: string
   *       - name: limit
   *         in: query
   *         required: true
   *         description: Limit penggunaan untuk API key ini
   *         schema:
   *           type: integer
   *       - name: adminpass
   *         in: query
   *         required: true
   *         description: Password admin untuk otorisasi
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Berhasil menambahkan API key
   *       400:
   *         description: Parameter tidak lengkap atau API key sudah ada
   *       403:
   *         description: Password admin salah
   */
  fastify.get("/admin/addkey", async (req, reply) => {
    const { apikey, limit, adminpass } = req.query;

    if (adminpass !== "rizkiganteng17") {
      return reply.code(403).send({ status: "error", message: "Unauthorized" });
    }
    if (!apikey || !limit) {
      return reply.code(400).send({ status: "error", message: "apikey dan limit wajib diisi" });
    }

    const keys = JSON.parse(fs.readFileSync(keyFilePath));
    if (keys[apikey]) {
      return reply.code(400).send({ status: "error", message: "API key sudah ada!" });
    }

    keys[apikey] = { limit: parseInt(limit) };
    fs.writeFileSync(keyFilePath, JSON.stringify(keys, null, 2));

    return reply.code(200).send({ status: "success", message: `API key ${apikey} berhasil ditambahkan.` });
  });

  /**
   * @swagger
   * /admin/listkey:
   *   get:
   *     summary: Menampilkan semua API key beserta limitnya (admin only)
   *     tags: [AdminAPIKey]
   *     parameters:
   *       - name: adminpass
   *         in: query
   *         required: true
   *         description: Password admin untuk otorisasi
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Data API key berhasil ditampilkan
   *       403:
   *         description: Password admin salah
   */
  fastify.get("/admin/listkey", async (req, reply) => {
    const { adminpass } = req.query;
    if (adminpass !== "rizkiganteng17") {
      return reply.code(403).send({ status: "error", message: "Unauthorized" });
    }

    const keys = JSON.parse(fs.readFileSync(keyFilePath));
    return reply.code(200).send({ status: "success", data: keys });
  });

  /**
   * @swagger
   * /admin/deletekey:
   *   get:
   *     summary: Menghapus API key tertentu (admin only)
   *     tags: [AdminAPIKey]
   *     parameters:
   *       - name: apikey
   *         in: query
   *         required: true
   *         description: API key yang ingin dihapus
   *         schema:
   *           type: string
   *       - name: adminpass
   *         in: query
   *         required: true
   *         description: Password admin untuk otorisasi
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: API key berhasil dihapus
   *       400:
   *         description: Parameter tidak lengkap
   *       403:
   *         description: Password admin salah
   *       404:
   *         description: API key tidak ditemukan
   */
  fastify.get("/admin/deletekey", async (req, reply) => {
    const { apikey, adminpass } = req.query;
    if (adminpass !== "rizkiganteng17") {
      return reply.code(403).send({ status: "error", message: "Unauthorized" });
    }
    if (!apikey) {
      return reply.code(400).send({ status: "error", message: "apikey wajib diisi" });
    }

    const keys = JSON.parse(fs.readFileSync(keyFilePath));
    if (!keys[apikey]) {
      return reply.code(404).send({ status: "error", message: "API key tidak ditemukan!" });
    }

    delete keys[apikey];
    fs.writeFileSync(keyFilePath, JSON.stringify(keys, null, 2));

    return reply.code(200).send({ status: "success", message: `API key ${apikey} berhasil dihapus.` });
  });
};
