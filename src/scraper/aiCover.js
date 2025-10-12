const WebSocket = require('ws');

const wss = 'wss://yanzbotz-waifu-yanzbotz.hf.space/queue/join';

function generateRandomLetters(length = 6) {
    let result = '';
    const alphabetLength = 26;

    for (let i = 0; i < length; i++) {
        const randomValue = Math.floor(Math.random() * alphabetLength);
        const randomLetter = String.fromCharCode('a'.charCodeAt(0) + randomValue);
        result += randomLetter;
    }

    return result;
}

function all(character, audio) {
    return new Promise(async (resolve, reject) => {
        let name = Math.floor(Math.random() * 100000000000000000) + await generateRandomLetters() + '.mp4';
        let characters = {
            "kobo": 2,
            "zeta": 0,
            "gura": 20,
            "kaela": 4,
            "pekora": 6,
            "miko": 8,
            "subaru": 10,
            "korone": 12,
            "luna": 14,
            "anya": 16,
            "reine": 18,
            "calli": 22,
            "kroni": 24
        };

        const fn_index = characters[character.toLowerCase()];
        if (typeof fn_index === 'undefined') {
            return resolve({ error: "Karakter tidak ditemukan" });
        }

        let result = {};
        const ws = new WebSocket(wss);

        ws.onopen = () => console.log("Connected to websocket");

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.msg === "send_hash") {
                ws.send(JSON.stringify({
                    fn_index,
                    session_hash: "dtniinetjz6"
                }));
            }

            if (message.msg === "estimation") {
                console.log("Menunggu antrean:", message.rank);
            }

            if (message.msg === "send_data") {
                ws.send(JSON.stringify({
                    fn_index,
                    data: [
                        {
                            data: "data:audio/mpeg;base64," + audio.toString('base64'),
                            name: name
                        },
                        0,
                        "pm",
                        0.6,
                        false,
                        "",
                        "en-US-AnaNeural-Female"
                    ],
                    event_data: null,
                    session_hash: "dtniinetjz6"
                }));
            }

            if (message.msg === "process_completed") {
                result.base64 = 'https://yanzbotz-waifu-yanzbotz.hf.space/file=' + message.output.data[1].name;
                ws.close();
                resolve(result);
            }
        };

        ws.onerror = (err) => {
            console.log("WebSocket error:", err);
            resolve({ error: "WebSocket error" });
        };

        ws.onclose = () => {
            if (!result.base64) {
                resolve({ error: "Proses gagal atau belum selesai" });
            }
        };
    });
}

module.exports = { all };
