const axios = require('axios');
const CryptoJS = require('crypto-js');
const FormData = require('form-data');

const noiseRemoval = {
  api: {
    base: 'https://noiseremoval.net/wp-content/plugins/audioenhancer',
    enhance: '/requests/noiseremoval/noiseremovallimited.php',
    timestamp: '/unix.php'
  },

  headers: {
    'authority': 'noiseremoval.net',
    'user-agent': 'Postify/1.0.0',
    'origin': 'https://noiseremoval.net',
    'referer': 'https://noiseremoval.net/',
    'x-requested-with': 'XMLHttpRequest'
  },

  constants: {
    timeout: 60000,
    mimek: [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/x-m4a',
      'audio/aac',
      'audio/mp4',
      'audio/opus',
      'audio/x-aiff',
      'audio/aiff',
      'audio/x-aifc',
      'video/mp4',
      'video/3gpp',
      'video/quicktime',
      'video/x-msvideo',
      'audio/x-m4b',
      'audio/x-m4p',
      'audio/x-m4r',
      'video/x-m4v'
    ],
    
    extensions: [
      '.m4a',
      '.mp4',
      '.3gp',
      '.m4b', 
      '.aac',
      '.m4p',
      '.m4r',
      '.m4v',
      '.aif',
      '.aiff',
      '.aifc',
      '.avi',
      '.mov',
      '.qt',
      '.mp3',
      '.opus',
      '.ogg',
      '.wav'
    ],
    
    modes: ['pulse', 'orbit']
  },

  fp: function() {
    const randomBytes = CryptoJS.lib.WordArray.random(16);
    return CryptoJS.enc.Hex.stringify(randomBytes);
  },

  enc: function(data) {
    const salt = CryptoJS.lib.WordArray.random(256);
    const iv = CryptoJS.lib.WordArray.random(16);
    
    const key = CryptoJS.PBKDF2("cryptoJS", salt, {
      hasher: CryptoJS.algo.SHA512,
      keySize: 8,
      iterations: 999
    });

    const encrypted = CryptoJS.AES.encrypt(data.toString(), key, {
      iv: iv
    });

    return {
      amtext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
      iavmol: CryptoJS.enc.Hex.stringify(iv),
      slam_ltol: CryptoJS.enc.Hex.stringify(salt)
    };
  },

  getUnixTimestamp: async function() {
    try {
      const response = await axios.get(`${this.api.base}${this.api.timestamp}`, {
        headers: this.headers
      });

      return {
        status: true,
        code: 200,
        result: response.data
      };
    } catch (error) {
      return {
        status: false,
        code: error.response?.status || 500,
        result: {
          error: 'Cukup tau aja yak bree, timestampnya gagal diambil 😑'
        }
      };
    }
  },

  info: async function(url) {
    try {
      const response = await axios.head(url);
      const disposition = response.headers['content-disposition'];
      let filename = 'audio.mp3';
      
      if (disposition) {
        const fail = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fail && fail[1]) {
          filename = fail[1].replace(/['"]/g, '');
        }
      }

      const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      const isExt = this.constants.extensions.includes(ext);

      const contentType = response.headers['content-type'];
      const isMime = this.constants.mimek.includes(contentType);

      if (!isExt && !isMime) {
        return {
          status: false,
          code: 400,
          result: {
            error: `File "${filename}" kagak support bree, yang boleh cuman format: ${this.constants.extensions.join(', ')} 👍🏻`
          }
        };
      }

      return {
        status: true,
        code: 200,
        result: {
          filename,
          mimetype: contentType
        }
      };

    } catch (error) {
      return {
        status: false,
        code: error.response?.status || 500,
        result: {
          error: 'Gagal ngecek file info bree 🗿',
          details: error.message
        }
      };
    }
  },

  dl: async function(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return {
        status: true,
        code: 200,
        result: Buffer.from(response.data, 'binary')
      };
    } catch (error) {
      return {
        status: false,
        code: error.response?.status || 500,
        result: {
          error: error.message.includes('timeout') ? 
            'Download timeout bree, coba lagi nanti yak 🤣' : 
            'Gagal downloadnya bree 🗿'
        }
      };
    }
  },

  remove: async function(url = '', mode = 'pulse') {
    if (!url) {
      return {
        status: false,
        code: 400,
        result: {
          error: 'Link filenya mana? lu niat ngehapus noise kagak sih 🗿'
        }
      };
    }

    if (!this.constants.modes.includes(mode)) {
      return {
        status: false,
        code: 400,
        result: {
          error: `Mode "${mode}" kagak ada bree, pilih salah satu: ${this.constants.modes.join(' atau ')} (default: pulse) 👍🏻`
        }
      };
    }

    try {
      new URL(url);
    } catch {
      return {
        status: false,
        code: 400,
        result: {
          error: 'Linknya kagak valid bree 👎🏻'
        }
      };
    }

    const infox = await this.info(url);
    if (!infox.status) return infox;

    const download = await this.dl(url);
    if (!download.status) return download;

    try {
      const timestamp = await this.getUnixTimestamp();
      if (!timestamp.status) return timestamp;

      const fingerprint = this.fp();
      const encx = this.enc(timestamp.result);

      const formData = new FormData();
      formData.append('media', download.result, {
        filename: infox.result.filename,
        contentType: infox.result.mimetype
      });
      formData.append('fingerprint', fingerprint);
      formData.append('mode', mode);
      formData.append('amtext', encx.amtext);
      formData.append('iavmol', encx.iavmol);
      formData.append('slam_ltol', encx.slam_ltol);

      const response = await axios.post(
        `${this.api.base}${this.api.enhance}`,
        formData,
        {
          headers: {
            ...this.headers,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: this.constants.timeout
        }
      );

      if (!response.data?.media) {
        return {
          status: false,
          code: 500,
          result: {
            error: 'Waduh response APInya error nih bree 😅'
          }
        };
      }

      const { media } = response.data;

      return {
        status: true,
        code: 200,
        result: {
          media
        }
      };
 
    } catch (error) {
      return {
        status: false,
        code: error.response?.status || 500,
        result: {
          error: 'Waduh error nih bree, coba lagi nanti ajaa yak 😅',
          details: error.message
        }
      };
    }
  }
};

module.exports = { noiseRemoval };
