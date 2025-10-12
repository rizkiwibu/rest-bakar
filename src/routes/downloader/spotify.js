const axios = require("axios");
const fastify = require("fastify")();

const client_id = "acc6302297e040aeb6e4ac1fbdfd62c3";
const client_secret = "0e8439a1280a43aba9a5bc0a16f3f009";
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Mendapatkan akses token dari Spotify
async function spotifyCreds() {
    try {
        const response = await axios.post(
            TOKEN_ENDPOINT,
            "grant_type=client_credentials", {
                headers: {
                    Authorization: "Basic " + basic,
                },
            },
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        return {
            status: false,
            msg: "Failed to retrieve Spotify credentials.",
        };
    }
}

const toTime = (ms) => {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
};

class Spotify {
    // Pencarian lagu Spotify
    search = async (query, type = "track", limit = 20) => {
        try {
            const creds = await spotifyCreds();
            if (!creds.status) return creds;

            const response = await axios.get(
                `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=${type}&offset=0&limit=${limit}`, {
                    headers: {
                        Authorization: "Bearer " + creds.data.access_token,
                    },
                },
            );

            if (
                !response.data[type + "s"] ||
                !response.data[type + "s"].items.length
            ) {
                return {
                    msg: "Music not found!",
                };
            }

            return response.data[type + "s"].items.map((item) => ({
                title: item.name,
                id: item.id,
                duration: toTime(item.duration_ms),
                artist: item.artists.map((artist) => artist.name).join(" & "),
                url: item.external_urls.spotify,
            }));
        } catch (error) {
            return {
                status: false,
                msg: "Error searching for music. " + error.message,
            };
        }
    };

    // Pengunduhan lagu Spotify
    download = async (url) => {
        const BASEURL = "https://api.fabdl.com";
        const headers = {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
        };

        try {
            const {
                data: info
            } = await axios.get(`${BASEURL}/spotify/get?url=${url}`, {
                headers
            });
            const {
                gid,
                id,
                name,
                image,
                duration_ms
            } = info.result;

            const {
                data: download
            } = await axios.get(`${BASEURL}/spotify/mp3-convert-task/${gid}/${id}`, {
                headers
            });
            if (download.result.download_url) {
                return {
                    title: name,
                    duration: duration_ms,
                    cover: image,
                    download: `${BASEURL}${download.result.download_url}`
                }
            }
        } catch (error) {
            console.error("Error downloading Spotify track:", error.message);
            throw new Error(error.message);
        }
    };

    // Mendapatkan daftar lagu dari playlist
    playlist = async function playlist(url) {
        try {
            const id = url.split("/playlist/")[0].trim().split("?si=")[0].trim();
            const {
                data
            } = await axios.get(
                "https://api.spotifydown.com/trackList/playlist/0F1VNeiZKjtX06yrVSqlbu", {
                    headers: {
                        Accept: "*/*",
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                        Origin: "https://spotifydown.com",
                        Referer: "https://spotifydown.com/",
                        "Referrer-Policy": "strict-origin-when-cross-origin",
                    },
                },
            ).catch(e => e.response);
            if (!data.trackList) return []
            return data.trackList.map((a) => ({
                ...a,
                url: "https://open.spotify.com/track/" + a.id
            }))
        } catch (err) {
            return []
        }
    }
}

/**
 * @swagger
 * /spotify/search:
 *   get:
 *     summary: Search for a Spotify track or playlist
 *     tags:
 *       - Spotify
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query (track name, artist, or playlist name)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved Spotify search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Track or playlist title
 *                   artist:
 *                     type: string
 *                     description: Artist(s) associated with the track or playlist
 *                   url:
 *                     type: string
 *                     description: URL to the track or playlist on Spotify
 *                   duration:
 *                     type: string
 *                     description: Track duration in HH:mm:ss format
 *                 example:
 *                   - title: "Blinding Lights"
 *                     artist: "The Weeknd"
 *                     url: "https://open.spotify.com/track/0fL4o9t9Ob7Z6k2W9lzXK5"
 *                     duration: "00:03:20"
 * 
 * /spotify/download:
 *   get:
 *     summary: Download a Spotify track in MP3 format
 *     tags:
 *       - Spotify
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         description: The URL of the Spotify track to be downloaded
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the download URL for the track
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Track title
 *                 artist:
 *                   type: string
 *                   description: Artist(s) of the track
 *                 download_url:
 *                   type: string
 *                   description: URL to download the track in MP3 format
 *                 cover:
 *                   type: string
 *                   description: URL to the album cover image
 *                 example:
 *                   title: "Blinding Lights"
 *                   artist: "The Weeknd"
 *                   download_url: "https://example.com/download/track.mp3"
 *                   cover: "https://example.com/cover.jpg"
 */
 /**
 * @swagger
 * /spotify/playlist:
 *   get:
 *     summary: Retrieve track list from a Spotify playlist
 *     tags:
 *       - Spotify
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         description: The URL of the Spotify playlist
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the track list from the Spotify playlist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Track title
 *                   artist:
 *                     type: string
 *                     description: Artist(s) of the track
 *                   url:
 *                     type: string
 *                     description: URL to the track on Spotify
 *                   duration:
 *                     type: string
 *                     description: Track duration in HH:mm:ss format
 *                 example:
 *                   - title: "Blinding Lights"
 *                     artist: "The Weeknd"
 *                     url: "https://open.spotify.com/track/0fL4o9t9Ob7Z6k2W9lzXK5"
 *                     duration: "00:03:20"
 *                   - title: "Save Your Tears"
 *                     artist: "The Weeknd"
 *                     url: "https://open.spotify.com/track/0C7UolFf7gtIbXTb1Vq6JX"
 *                     duration: "00:03:35"
 */
 

module.exports = async (fastify) => {
    // Endpoint pencarian Spotify
    fastify.get("/spotify/search", async (request, reply) => {
        try {
            const { query } = request.query;
            if (!query) {
                return reply.status(400).send({ status: false, message: "Missing query parameter" });
            }
            const result = await new Spotify().search(query);
            return reply.send({ status: true, data: result });
        } catch (error) {
            return reply.status(500).send({ status: false, message: error.message });
        }
    });

    // Endpoint pengunduhan Spotify
    fastify.get("/spotify/download", async (request, reply) => {
        try {
            const { url } = request.query;
            if (!url) {
                return reply.status(400).send({ status: false, message: "Missing url parameter" });
            }
            const result = await new Spotify().download(url);
            return reply.send({ status: true, data: result });
        } catch (error) {
            return reply.status(500).send({ status: false, message: error.message });
        }
    });

    // Endpoint daftar lagu dalam playlist
    fastify.get("/spotify/playlist", async (request, reply) => {
        try {
            const { url } = request.query;
            if (!url) {
                return reply.status(400).send({ status: false, message: "Missing url parameter" });
            }
            const result = await new Spotify().playlist(url);
            return reply.send({ status: true, data: result });
        } catch (error) {
            return reply.status(500).send({ status: false, message: error.message });
        }
    });
};
