const Websocket = require("ws");
const crypto = require("node:crypto");
const axios = require("axios");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

const WS_URL = "wss://pixnova.ai/demo-photo2anime/queue/join";
const IMAGE_URL = "https://oss-global.pixnova.ai/";
const SESSION = crypto.randomBytes(5).toString("hex").slice(0, 9);
let wss;
let promise;

/**
 * @swagger
 * tags:
 *   name: Jadianime
 *   description: Mengubah gambar menjadi anime
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /jadianime:
     *   get:
     *     summary: Mengubah gambar menjadi anime
     *     tags: [Jadianime]
     *     parameters:
     *       - name: image
     *         in: query
     *         required: true
     *         description: URL gambar yang akan diubah menjadi anime
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
     *         description: Gambar berhasil diubah menjadi anime
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: URL gambar tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    
    fastify.get("/jadianime", { preHandler: validateApiKey }, async (req, reply) => {
        const { image } = req.query;

        if (!image) {
            return reply.code(400).send({
                status: "error",
                message: "URL gambar tidak boleh kosong!"
            });
        }

        try {
            const result = await PixNova(image, true);
            const imageUrl = result.output.result[0];
            return reply.code(200).send({
                status: "success",
                image: imageUrl
            });
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan saat mengubah gambar!"
            });
        }
    });

    async function PixNova(imageUrl, log) {
        let base64Image;
        if (/https\:\/\/|http\:\/\//i.test(imageUrl)) {
            const gs = await axios.get(imageUrl, { responseType: "arraybuffer" });
            const kb = gs.data;
            base64Image = Buffer.from(kb).toString("base64");
        } else {
            throw new Error("URL gambar tidak valid");
        }

        await _connect(log);
        let payload = {
            session_hash: SESSION
        };
        const resp = await _send(payload, true);
        if (log) console.log(`[ ${SESSION} ] Hash: ${JSON.stringify(resp, null, 2)}`);
        
        payload = {
            "data": {
                "source_image": `data:image/jpeg;base64,${base64Image}`,
                "strength": 0.6,
                "prompt": "(masterpiece), best quality",
                "negative_prompt": "(worst quality, low quality:1.4), (greyscale, monochrome:1.1), cropped, lowres, watermark, blurry, ugly face, extra leg, text",
                "request_from": 2
            }
        };
        const out = await _send(payload, false);
        return out;
    }

    function _connect(log) {
        return new Promise((resolve, reject) => {
            wss = new Websocket(WS_URL);
            wss.on("open", () => {
                console.log("[ INFO ] Koneksi ke websocket tersambung.");
                resolve();
            });

            wss.on("error", (error) => {
                console.error("[ ERROR ] " + error);
                reject(error);
            });

            wss.on("message", (chunk) => {
                const data = JSON.parse(chunk.toString());
                if (promise && promise.once) {
                    promise.call(data);
                    promise = null;
                } else if (promise && !promise.once) {
                    if (log) console.log(data);
                    if (data?.code && data.code == 200 && data?.success && data.success == true) {
                        let amba = data;
                        amba.output.result.forEach((_, i) => {
                            amba.output.result[i] = IMAGE_URL + amba.output.result[i];
                        });
                        promise.call(amba);
                        promise = null;
                    }
                }
            });
        });
    }

    function _send(payload, pr) {
        return new Promise(resolve => {
            wss.send(JSON.stringify(payload));
            if (pr) {
                promise = {
                    once: true,
                    call: resolve
                };
            } else {
                promise = {
                    once: false,
                    call: resolve
                };
            }
        });
    }
};
