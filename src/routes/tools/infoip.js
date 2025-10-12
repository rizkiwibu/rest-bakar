const axios = require("axios");
const useragent = require("useragent");

/**
 * @swagger
 * tags:
 *   name: DeviceInfo
 *   description: Mendapatkan informasi IP, lokasi, dan user device

 * /device/info:
 *   get:
 *     summary: Mengambil IP address, lokasi berbasis IP, dan info device user
 *     tags: [DeviceInfo]
 *     responses:
 *       200:
 *         description: Informasi berhasil diambil
 *         content:
 *           application/json:
 *             example:
 *               ip: "114.10.20.30"
 *               location:
 *                 country: "Indonesia"
 *                 region: "Jakarta"
 *                 city: "South Jakarta"
 *                 lat: -6.2000
 *                 lon: 106.8167
 *               userAgent: "Mozilla/5.0 (Linux; Android 11; Redmi Note 9...)"
 *               browser: "Chrome"
 *               os: "Android 11"
 *               device: "Mobile"
 *       500:
 *         description: Gagal mengambil data lokasi/IP
 */

module.exports = async (fastify) => {
  fastify.get("/device/info", async (req, reply) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const ua = req.headers["user-agent"];
    const agent = useragent.parse(ua);

    try {
      const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
      return reply.send({
        ip,
        location: {
          country: data.country,
          region: data.regionName,
          city: data.city,
          lat: data.lat,
          lon: data.lon,
        },
        userAgent: ua,
        browser: agent.family,
        os: agent.os.toString(),
        device: /mobile/i.test(ua) ? "Mobile" : "Desktop"
      });
    } catch (err) {
      return reply.code(500).send({ error: "Gagal mendapatkan data lokasi/IP" });
    }
  });
};
