const url = require("url");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

module.exports = async (fastify) => {
    /**
     * @swagger
     * /convert/openclash/trojan:
     *   get:
     *     summary: Konversi Trojan URL ke format Clash
     *     tags: [OpenClashConverter]
     *     parameters:
     *       - name: trojanURL
     *         in: query
     *         required: true
     *         description: Trojan URL yang akan dikonversi
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
     *         description: Berhasil mengonversi URL
     *       403:
     *         description: API key tidak valid
     *       400:
     *         description: Parameter tidak boleh kosong
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/convert/openclash/trojan", { preHandler: validateApiKey }, async (req, reply) => {
        const { trojanURL } = req.query;

        if (!trojanURL) {
            return reply.code(400).send({
                status: "error",
                message: "Trojan URL tidak boleh kosong!"
            });
        }

        try {
            const result = convertTrojanToClash(trojanURL);
            return reply.code(200).send(result);
        } catch (error) {
            return reply.code(500).send({
                status: "error",
                message: error.message
            });
        }
    });
};

function convertTrojanToClash(trojanURL) {
    const parsed = new URL(trojanURL);
    if (parsed.protocol !== "trojan:") {
        throw new Error("Invalid Trojan URL");
    }

    const password = parsed.username;
    const server = parsed.hostname;
    const port = parsed.port || 443;
    const params = new URLSearchParams(parsed.search);
    const path = params.get("path") || "/";
    const sni = params.get("sni") || parsed.host;
    const host = params.get("host") || sni;
    const name = decodeURIComponent(parsed.hash.substring(1)) || "ikystorehosting";

    return {
        "port": 7890,
        "socks-port": 7891,
        "redir-port": 7892,
        "mixed-port": 7893,
        "tproxy-port": 7895,
        "ipv6": false,
        "mode": "rule",
        "log-level": "silent",
        "allow-lan": true,
        "external-controller": "0.0.0.0:9090",
        "secret": "",
        "bind-address": "*",
        "unified-delay": true,
        "profile": { "store-selected": true },
        "dns": {
            "enable": true,
            "ipv6": false,
            "enhanced-mode": "redir-host",
            "listen": "0.0.0.0:7874",
            "nameserver": ["8.8.8.8", "1.0.0.1", "https://dns.google/dns-query"],
            "fallback": ["1.1.1.1", "8.8.4.4", "https://cloudflare-dns.com/dns-query", "112.215.203.254"],
            "default-nameserver": ["8.8.8.8", "1.1.1.1", "112.215.203.254"]
        },
        "proxies": [
            {
                "name": name,
                "server": server,
                "port": parseInt(port),
                "type": "trojan",
                "password": password,
                "skip-cert-verify": true,
                "sni": sni,
                "network": "ws",
                "ws-opts": {
                    "path": path,
                    "headers": { "Host": host }
                },
                "udp": true
            }
        ],
        "proxy-groups": [
            {
                "name": "ikystorehosting",
                "type": "select",
                "proxies": [name, "DIRECT"]
            }
        ],
        "rules": ["MATCH,ikystorehosting"]
    };
}
