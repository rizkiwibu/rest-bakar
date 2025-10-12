const validateApiKey = require("../../middlewares/validateApiKey");  // Import middleware

const axios = require("axios");

const terabox = {
  api: {
    base: "https://teraboxdl.site/api/",
    token: "token",
    terabox: "terabox",
  },

  headers: {
    authority: "teraboxdl.site",
    "user-agent": "Postify/1.0.0",
  },

  token: null,

  getToken: async () => {
    if (terabox.token) {
      return {
        status: "success",
        code: 200,
        result: terabox.token,
      };
    }

    try {
      const response = await axios.get(`${terabox.api.base}${terabox.api.token}`, {
        headers: terabox.headers,
      });
      const { data, status } = response;

      if (!data || !data.token) {
        return {
          status: "error",
          code: 404,
          message: "Tokennya kagak ada bree, coba lagi nanti yak 😬",
        };
      }

      terabox.token = data.token;
      return {
        status: "success",
        code: status,
        result: terabox.token,
      };
    } catch (error) {
      return {
        status: "error",
        code: error.response ? error.response.status : 500,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  isUrl: (url) => {
    const match = url.match(/https?:\/\/(?:www\.)?(?:\w+)\.(com|app)\/s\/([^\/]+)/i);
    return match ? `https://1024terabox.com/s/${match[2]}` : null;
  },

  request: async (endpoint, params = {}) => {
    const toket = await terabox.getToken();
    if (toket.status === "error") {
      return toket;
    }

    const url = `${terabox.api.base}${endpoint}?` + new URLSearchParams(params);

    try {
      const res = await axios.get(url, {
        headers: { ...terabox.headers, "x-access-token": toket.result },
      });
      const { data, status } = res;

      if (!data || Object.keys(data).length === 0) {
        return {
          status: "error",
          code: status,
          message: "Kagak ada response dari apinya bree...",
        };
      }

      return {
        status: "success",
        code: status,
        result: data.data,
      };
    } catch (error) {
      return {
        status: "error",
        code: error.response ? error.response.status : 500,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  download: async (url) => {
    if (!url || typeof url !== "string" || url.trim() === "") {
      return {
        status: "error",
        code: 400,
        message: "Lu niat download pake Terabox kagak? Input lu kosong anjiir 🙃",
      };
    }

    const linkNya = terabox.isUrl(url.trim());
    if (!linkNya) {
      return {
        status: "error",
        code: 400,
        message: 'Kagak valid tuh linknya.. link yang dibolehin tuh kek gini "https://terabox.com/s/abcdefgh"',
      };
    }

    const response = await terabox.request(terabox.api.terabox, { url: linkNya });

    return response.status === "error" ? response : { status: "success", code: 200, result: response.result };
  },
};

/**
 * @swagger
 * /terabox:
 *   get:
 *     summary: Download file dari Terabox
 *     tags:
 *       - Terabox
 *     parameters:
 *       - name: url
 *         in: query
 *         required: true
 *         description: URL Terabox yang ingin diunduh
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
 *         description: Berhasil mendapatkan link download
 *       403:
 *         description: API key tidak valid atau limit habis
 *       400:
 *         description: URL tidak valid atau kosong
 *       500:
 *         description: Kesalahan server
 */

module.exports = async (fastify) => {
  fastify.get("/terabox", { preHandler: validateApiKey }, async (request, reply) => {
    const { url } = request.query;

    if (!url || typeof url !== "string" || url.trim() === "") {
      return reply.code(400).send({
        status: "error",
        code: 400,
        message: "URL tidak boleh kosong!",
      });
    }

    const result = await terabox.download(url.trim());
    return reply.code(result.code).send(result);
  });
};
