const axios = require('axios');

/**
 * Extracts fileId and fileKey from a Mega.nz URL
 * @param {string} url - The Mega.nz URL
 * @returns {Object} { fileId, fileKey, error }
 */
const extractMegaInfo = (url) => {
    try {
        const decodedUrl = decodeURIComponent(url);
        let fileId, fileKey;

        // Support various Mega link formats
        const patterns = [
            /\/file\/([a-zA-Z0-9_-]+)(?:#|\?|$)/,    // /file/{id}#
            /\/embed\/([a-zA-Z0-9_-]+)(?:#|\?|$)/,   // /embed/{id}#
            /#?([a-zA-Z0-9_-]+)!([a-zA-Z0-9_-]+)/    // /#{id}!{key}
        ];

        for (const pattern of patterns) {
            const match = decodedUrl.match(pattern);
            if (match) {
                if (pattern.source.includes('embed') || pattern.source.includes('file')) {
                    fileId = match[1];
                    const keySplit = decodedUrl.split("#");
                    fileKey = keySplit[1] || null;
                } else if (pattern.source.includes('#?')) {
                    fileId = match[1];
                    fileKey = match[2] || null;
                }
                break;
            }
        }

        if (!fileId) return { error: "Invalid Mega URL: Could not extract file ID." };
        if (!fileKey) return { error: "Invalid Mega URL: Missing decryption key (part after #)." };

        return { fileId, fileKey };
    } catch (e) {
        return { error: "Error parsing Mega URL: " + e.message };
    }
};

/**
 * Formats error JSON
 * @param {string} message - Error message
 * @returns {Object}
 */
const _errorResponse = (message) => ({
    creator: "@ikykunnnn",
    status: false,
    message
});

/**
 * Main scraper function to download or fetch Mega file info
 * @param {string} url - The Mega.nz URL
 * @returns {Promise<Object>}
 */
const megaDownloader = async (url) => {
    try {
        const { fileId, fileKey, error } = extractMegaInfo(url);
        if (error) return _errorResponse(error);

        // Disini kamu tinggal implementasi fetching Mega API
        // Untuk sekarang aku kasih dummy response
        return {
            creator: "@ikykunnnn",
            status: true,
            message: "Successfully extracted Mega info",
            result: {
                fileId,
                fileKey,
                downloadLink: `https://mega.nz/file/${fileId}#${fileKey}`
            }
        };

        // NOTE: Kalau mau download file langsung, 
        // perlu pakai Mega SDK atau scraping iframe embed-nya.
    } catch (e) {
        return _errorResponse("Unexpected error: " + e.message);
    }
};

module.exports = megaDownloader;
