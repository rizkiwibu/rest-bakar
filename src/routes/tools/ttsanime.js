const validateApiKey = require("../../middlewares/validateApiKey");
const WebSocket = require("ws");
const axios = require("axios");

/**
 * @swagger
 * tags:
 *   - name: "TTS Anime"
 *     description: "Text to Speech karakter anime (Umamusume VITS)"
 */

class UmaVoiceSynth {
  constructor() {
    this.sessionHash = `${Math.random().toString(36).substring(2, 12)}`;
    this.baseUrl = "devstok-vits-umamusume-voice-synthesizer.hf.space";
    this.ws = null;
    this.text = "";
    this.voice = "";
    this.lang = "日本語";
    this.speed = 1;
    this.resolve = null;
    this.reject = null;
  }

  async list() {
    try {
      const response = await axios.get(`https://${this.baseUrl}`);
      const match = response.data.match(/window\.gradio_config = ({.*?});/s);
      if (match && match[1]) {
        const config = JSON.parse(match[1]);
        const components = config.components;
        const voice1 = components.find(item => item.id === 16)?.props?.choices;
        const lang1 = components.find(item => item.id === 17)?.props?.choices;
        const voice2 = components.find(item => item.id === 38)?.props?.choices;
        const lang2 = components.find(item => item.id === 39)?.props?.choices;
        const voices = [voice1, voice2].filter(Boolean).sort();
        const langs = [lang1, lang2].filter(Boolean).sort();
        const indexedVoices = voices.map((voice, index) => ({
          index,
          voice
        }));
        const indexedLangs = langs.map((lang, index) => ({
          index,
          lang
        }));
        return {
          voice: indexedVoices,
          lang: indexedLangs
        };
      }
      throw new Error("window.gradio_config tidak ditemukan");
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create({ text = "こんにちは", voice = "派蒙 Paimon (Genshin Impact)", lang = "日本語", speed = 1 }) {
    this.text = text;
    this.voice = voice;
    this.lang = lang;
    this.speed = speed;

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.ws = new WebSocket(`wss://${this.baseUrl}/queue/join`, {
        headers: {
          Origin: `https://${this.baseUrl}`
        }
      });

      this.ws.on("open", () => console.log("[WS] Connected"));
      this.ws.on("error", (err) => reject(err));
      this.ws.on("close", () => console.log("[WS] Closed"));
      this.ws.on("message", (data) => this.handleMessage(data));
    });
  }

  async handleMessage(raw) {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.msg === "send_hash") {
        this.ws.send(JSON.stringify({
          session_hash: this.sessionHash,
          fn_index: 2
        }));
      } else if (msg.msg === "send_data") {
        this.ws.send(JSON.stringify({
          fn_index: 2,
          data: [this.text, this.voice, this.lang, this.speed, false],
          session_hash: this.sessionHash
        }));
      } else if (msg.msg === "process_completed") {
        this.ws.close();
        const filePath = msg.output.data[1]?.name;
        if (!filePath) return this.reject(new Error("File audio tidak ditemukan"));

        const url = `https://${this.baseUrl}/file=${filePath}`;
        const audioRes = await axios.get(url, { responseType: "arraybuffer" });
        this.resolve({ buffer: Buffer.from(audioRes.data) });
      }
    } catch (err) {
      this.reject(err);
      if (this.ws) this.ws.close();
    }
  }
}

module.exports = async (fastify) => {
 /**
 * @swagger
 * tags:
 *   - name: "TTS Anime"
 *     description: "Text to Speech karakter anime (Umamusume VITS)"
 */

/**
 * @swagger
 * /tts/anime:
 *   get:
 *     summary: "Konversi teks menjadi suara karakter anime"
 *     tags: ["TTS Anime"]
 *     parameters:
 *       - name: "text"
 *         in: "query"
 *         required: true
 *         description: "Teks yang ingin diubah menjadi suara"
 *         schema:
 *           type: "string"
 *       - name: "voice"
 *         in: "query"
 *         required: false
 *         description: "Nama karakter anime (lihat endpoint /tts/anime/list)"
 *         schema:
 *           type: "string"
 *       - name: "lang"
 *         in: "query"
 *         required: false
 *         description: "Bahasa suara (default: 日本語)"
 *         schema:
 *           type: "string"
 *       - name: "speed"
 *         in: "query"
 *         required: false
 *         description: "Kecepatan suara (default: 1)"
 *         schema:
 *           type: "number"
 *       - name: "apikey"
 *         in: "query"
 *         required: true
 *         description: "API key untuk autentikasi"
 *         schema:
 *           type: "string"
 *     responses:
 *       200:
 *         description: "File audio MP3 dari teks"
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: "string"
 *               format: "binary"
 *       400:
 *         description: "Parameter tidak lengkap"
 *       403:
 *         description: "API key tidak valid"
 *       500:
 *         description: "Gagal memproses permintaan"
 */
  fastify.get("/tts/anime", { preHandler: validateApiKey }, async (req, reply) => {
    const { text, voice, lang, speed } = req.query;

    if (!text) {
      return reply.code(400).send({
        status: "error",
        message: "Parameter text wajib diisi"
      });
    }

    try {
      const synth = new UmaVoiceSynth();
      const { buffer } = await synth.create({ text, voice, lang, speed });

      reply
  .header("Content-Type", "audio/mpeg")
  .header("Content-Disposition", "inline; filename=voice.mp3")
  .send(buffer);
    } catch (error) {
      reply.code(500).send({ status: "error", message: error.message });
    }
  });

  /**
   * @swagger
   * /tts/anime/list:
   *   get:
   *     summary: "Daftar karakter dan bahasa yang tersedia"
   *     tags: ["TTS Anime"]
   *     parameters:
   *       - name: apikey
   *         in: query
   *         required: true
   *         description: API key untuk autentikasi
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Daftar voice dan language
   *       403:
   *         description: API key tidak valid
   *       500:
   *         description: Terjadi kesalahan
   */
  fastify.get("/tts/anime/list", { preHandler: validateApiKey }, async (req, reply) => {
    try {
      const synth = new UmaVoiceSynth();
      const list = await synth.list();
      reply.send({ status: "success", ...list });
    } catch (err) {
      reply.code(500).send({ status: "error", message: err.message });
    }
  });
};