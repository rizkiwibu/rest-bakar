const axios = require('axios');

const headers = {
  "content-type": "application/json",
  "origin": "https://www.grabtheclip.com",
  "referer": "https://www.grabtheclip.com/",
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getInfo(url) {
  try {
    let reqInfo = await axios.post('https://api.grabtheclip.com/submit-info', { url }, { headers });
    let info = await axios.get(`https://api.grabtheclip.com/get-info/${reqInfo.data.task_id}`, { headers });

    while (info.data.status === "Pending") {
      await delay(2000);
      info = await axios.get(`https://api.grabtheclip.com/get-info/${reqInfo.data.task_id}`, { headers });
    }

    return { status: true, code: 200, result: info.data.result };
  } catch (error) {
    return { status: false, code: 500, error: error.message };
  }
}

async function getVideo(url, height = 360) {
  try {
    let reqDown = await axios.post('https://api.grabtheclip.com/submit-download', { height, media_type: "video", url }, { headers });
    let down = await axios.get(`https://api.grabtheclip.com/get-download/${reqDown.data.task_id}`, { headers });

    while (down.data.status === "Pending") {
      await delay(2000);
      down = await axios.get(`https://api.grabtheclip.com/get-download/${reqDown.data.task_id}`, { headers });
    }

    return { status: true, code: 200, result: down.data.result.url };
  } catch (error) {
    return { status: false, code: 500, error: error.message };
  }
}

async function getAudio(url) {
  try {
    let reqDown = await axios.post('https://api.grabtheclip.com/submit-download', { height: 0, media_type: "audio", url }, { headers });
    let down = await axios.get(`https://api.grabtheclip.com/get-download/${reqDown.data.task_id}`, { headers });

    while (down.data.status === "Pending") {
      await delay(2000);
      down = await axios.get(`https://api.grabtheclip.com/get-download/${reqDown.data.task_id}`, { headers });
    }

    return { status: true, code: 200, result: down.data.result.url };
  } catch (error) {
    return { status: false, code: 500, error: error.message };
  }
}

module.exports = { getInfo, getVideo, getAudio };
