const axios = require('axios');

const model = [
    "yanzgpt-revolution-25b-v3.5", // Default
    "yanzgpt-legacy-72b-v3.5", // Pro
    "yanzgpt-r1-70b-v3.5" // Reasoning
];

exports.YanzGPT = (query, prompt, modelChoice) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios("https://api.yanzgpt.my.id/v1/chat", {
                headers: {
                    authorization: "Bearer yzgpt-sc4tlKsMRdNMecNy",
                    "content-type": "application/json"
                },
                data: {
                    messages: [
                        {
                            role: "system",
                            content: prompt
                        },
                        {
                            role: "user",
                            content: query
                        }
                    ],
                    model: modelChoice || model[0] // Default to "yanzgpt-revolution-25b-v3.5"
                },
                method: "POST"
            });
            resolve(response.data);
        } catch (error) {
            reject({ status: 500, error: error.message });
        }
    });
};
