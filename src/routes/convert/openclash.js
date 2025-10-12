const axios = require("axios");
const yaml = require("js-yaml");
const validateApiKey = require("../../middlewares/validateApiKey");
const { Buffer } = require("buffer");

/**
 * @swagger
 * tags:
 *   - name: OpenClashConverter
 *     description: API untuk mengonversi VMess ke format OpenClash YAML
 */

module.exports = async (fastify) => {
    /**
     * @swagger
     * /convert/openclash/vmess:
     *   get:
     *     summary: Konversi VMess ke OpenClash YAML
     *     tags:
     *       - OpenClashConverter
     *     parameters:
     *       - name: input
     *         in: query
     *         required: true
     *         description: Link VMess
     *         schema:
     *           type: string
     *           example: "vmess://eyJhZGQiOiIxMDQuMTguMi4yIiwiYWlkIjoiMCIs..."
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil mengonversi ke format OpenClash YAML
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Parameter tidak boleh kosong atau format salah
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/convert/openclash/vmess", { preHandler: validateApiKey }, async (req, reply) => {
        const { input } = req.query;

        if (!input) {
            return reply.code(400).send({
                status: "error",
                message: "Parameter 'input' tidak boleh kosong!"
            });
        }

        let proxyConfig = null;

        // Deteksi apakah formatnya VMess
        if (input.startsWith("vmess://")) {
            try {
                const base64Data = input.replace("vmess://", "");
                const decodedData = JSON.parse(Buffer.from(base64Data, "base64").toString("utf-8"));

                proxyConfig = {
                    name: decodedData.ps || "VMess Node",
                    server: decodedData.add,
                    port: parseInt(decodedData.port),
                    type: "vmess",
                    uuid: decodedData.id,
                    alterId: decodedData.aid || 0,
                    cipher: decodedData.scy || "auto",
                    network: decodedData.net || "ws",
                    tls: decodedData.tls === "tls",
                    sni: decodedData.sni || decodedData.host || "",
                    ws_opts: {
                        path: decodedData.path || "/",
                        headers: { Host: decodedData.host || "" }
                    },
                    udp: true
                };
            } catch (error) {
                return reply.code(400).send({
                    status: "error",
                    message: "Format VMess tidak valid!"
                });
            }
        } else {
            return reply.code(400).send({
                status: "error",
                message: "Format input tidak dikenali! Harus VMess."
            });
        }

        // Format OpenClash YAML
        const openClashConfig = {
            port: 7890,
            socks_port: 7891,
            redir_port: 7892,
            mixed_port: 7893,
            tproxy_port: 7895,
            ipv6: false,
            mode: "rule",
            log_level: "silent",
            allow_lan: true,
            external_controller: "0.0.0.0:9090",
            secret: "",
            bind_address: "*",
            unified_delay: true,
            profile: {
                store_selected: true
            },
            dns: {
                enable: true,
                ipv6: false,
                enhanced_mode: "redir-host",
                listen: "0.0.0.0:7874",
                nameserver: [
                    "8.8.8.8",
                    "1.0.0.1",
                    "https://dns.google/dns-query"
                ],
                fallback: [
                    "1.1.1.1",
                    "8.8.4.4",
                    "https://cloudflare-dns.com/dns-query",
                    "112.215.203.254"
                ],
                default_nameserver: [
                    "8.8.8.8",
                    "1.1.1.1",
                    "112.215.203.254"
                ]
            },
            proxies: [proxyConfig],
            proxy_groups: [
                {
                    name: "VMess Node",
                    type: "select",
                    proxies: [proxyConfig.name, "DIRECT"]
                }
            ],
            rules: [
                "MATCH,VMess Node"]
        };

        const yamlData = yaml.dump(openClashConfig);

        return reply.header("Content-Type", "text/yaml").send(yamlData);
    });
};
