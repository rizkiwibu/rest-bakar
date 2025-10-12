const axios = require("axios");

async function Screenshot(url) {
    try {
        const response = await axios.get(`https://image.thum.io/get/png/fullpage/viewportWidth/2400/${url}`, {
            responseType: "arraybuffer",
        });

        return {
            status: 200,
            type: "image/png",
            buffer: response.data,
        };
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = { Screenshot };
