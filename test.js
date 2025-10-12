const axios = require("axios");
const { chromium } = require("playwright");

async function getUmidToken() {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto("https://chat.qwen.ai/", { waitUntil: "networkidle" });

        await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://g.alicdn.com/AWSC/AWSC/awsc.js";
                script.onload = () => resolve("AWSC loaded");
                script.onerror = () => reject("Gagal memuat AWSC");
                document.head.appendChild(script);
            });
        });

        await page.waitForFunction(() => window.__baxia__ && window.__baxia__.getFYModule, null, { timeout: 10000 });

        const uidToken = await page.evaluate(() => {
            const getStore = (e, t) => {
                var r = window.__baxia__ || {};
                return e ? r[e] || t : r;
            };

            const getUmidToken = () => {
                var e = getStore("getFYModule", {}); 
                return e && e.getUidToken ? e.getUidToken() || null : null;
            };

            return getUmidToken();
        });

        if (!uidToken) throw new Error("Gagal mendapatkan UID Token");
        console.log("✅ New UID Token:", uidToken);

        await browser.close(); 
        return uidToken;
    } catch (error) {
        throw error;
    }
}

async function qwenChat(message, uidToken = null, retryCount = 0) {
    try {
        if (retryCount > 2) throw new Error("Permintaan gagal setelah 3 kali percobaan");
        if (!uidToken) uidToken = await getUmidToken();
        if (!uidToken) throw new Error("Gagal mendapatkan UID Token");

        const { data } = await axios.post("https://chat.qwen.ai/api/chat/completions", {
                stream: false,
                incremental_output: true,
                chat_type: "t2t",
                model: "qwen-turbo-latest",
                messages: [
                    {
                        role: "user",
                        content: message,
                        chat_type: "t2t",
                        extra: {},
                        feature_config: {
                            thinking_enabled: false,
                        },
                    },
                ],
            }, {
                headers: {
                    "authority": "chat.qwen.ai",
                    "accept": "*/*",
                    "content-type": "application/json",
                    "cookie": 'ssxmod_itna=2',
                    "origin": "https://chat.qwen.ai",
                    "referer": "https://chat.qwen.ai/",
                    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
                    "bx-umidtoken": uidToken
                }
            }
        );

        if (data.error && data.error.includes("code 401")) {
            console.log("UID Token kadaluarsa, memuat ulang UID baru...");
            return qwenChat(message, null, retryCount + 1);
        }

        return data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("UID Token kadaluarsa, memuat ulang UID baru...");
            return qwenChat(message, null, retryCount + 1);
        }
        throw error;
    }
}

(async () => {
    const message = 'Halo, apa kabar?';
    const uidToken = "T2gAqFlLBsMCyQj6sEtIzi7ysWD56GzyuJkb0Fdi-UwIqaxx0b7CZfcRdHbUs="
    const response = await qwenChat(message, uidToken);
    console.log(response);
    console.log(response.choices[0].message.content);
})();
