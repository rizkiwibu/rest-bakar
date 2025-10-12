const fetch = require("node-fetch");
const FormData = require("form-data");

/**
 * Generate a random 32-character string (for product-serial header)
 */
function generateRandomString(length) {
    const characters = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Enhance image quality using unblurimage.ai
 * @param {string} url - URL of the image to process
 * @returns {Promise<string>} Enhanced image URL
 */
async function unblur(url) {
    try {
        // 1. Download image as buffer
        const imageResponse = await fetch(url);
        if (!imageResponse.ok) throw new Error("Failed to fetch image");
        const imageBuffer = await imageResponse.buffer(); // Use buffer instead of blob()

        // 2. Prepare form data
        const formData = new FormData();
        formData.append("original_image_file", imageBuffer, { filename: "image.jpg", contentType: "image/jpeg" });
        formData.append("scale_factor", "2"); // 2x or 4x upscale
        formData.append("upscale_type", "image-upscale");

        // 3. Set headers
        const headers = {
            accept: "*/*",
            "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
            origin: "https://unblurimage.ai",
            "product-serial": generateRandomString(32),
            referer: "https://unblurimage.ai/",
            ...formData.getHeaders(), // Important for multipart request
        };

        // 4. Create enhancement job
        const createJob = await fetch(
            "https://api.unblurimage.ai/api/imgupscaler/v1/ai-image-upscale/create-job",
            { method: "POST", headers, body: formData }
        );

        const jobData = await createJob.json();
        if (!jobData.result || !jobData.result.job_id) throw new Error("Failed to create enhancement job");

        const jobId = jobData.result.job_id;

        // 5. Poll for job completion
        const checkStatus = async () => {
            const checkJob = await fetch(
                `https://api.unblurimage.ai/api/imgupscaler/v1/ai-image-upscale/get-job/${jobId}`,
                { headers }
            );
            return await checkJob.json();
        };

        let result;
        while (true) {
            const status = await checkStatus();

            if (status.code === 100000) {
                result = status.result.output_url[0];
                break;
            } else if (status.code === 300006) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
            } else {
                throw new Error(status.message.en);
            }
        }

        return result;
    } catch (error) {
        throw new Error(`Failed: ${error.message}`);
    }
}

module.exports = { unblur };
