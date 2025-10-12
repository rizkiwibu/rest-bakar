const axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware validasi API Key

/**
 * @swagger
 * /Instagram/igdl:
 *   get:
 *     summary: Download videos from Instagram
 *     tags:
 *       - Instagram
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The Instagram URL to download
 *       - in: query
 *         name: apikey
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved download links
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of download URLs
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     caption:
 *                       type: string
 *                       description: Caption of the Instagram post
 *                     username:
 *                       type: string
 *                       description: Instagram username of the post owner
 *                     like:
 *                       type: integer
 *                       description: Number of likes
 *                     comment:
 *                       type: integer
 *                       description: Number of comments
 *                     isVideo:
 *                       type: boolean
 *                       description: Whether the post is a video
 *       400:
 *         description: Invalid URL provided
 *       500:
 *         description: Internal server error
 */

// Get Instagram video download links
async function getDownloadLinks(url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!url.match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/) && !url.match(/(https|http):\/\/www.instagram.com\/(p|reel|tv|stories)/gi)) {
        return reject({
          msg: "Invalid URL"
        });
      }

      // Helper functions for scraping (similar to original code)
      function decodeData(data) {
        let [part1, part2, part3, part4, part5, part6] = data;
        function decodeSegment(segment, base, length) {
          const charSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split("");
          let baseSet = charSet.slice(0, base);
          let decodeSet = charSet.slice(0, length);
          let decodedValue = segment.split("").reverse().reduce((accum, char, index) => {
            if (baseSet.indexOf(char) !== -1) {
              return accum += baseSet.indexOf(char) * Math.pow(base, index);
            }
          }, 0);
          let result = "";
          while (decodedValue > 0) {
            result = decodeSet[decodedValue % length] + result;
            decodedValue = Math.floor(decodedValue / length);
          }
          return result || "0";
        }
        part6 = "";
        for (let i = 0, len = part1.length; i < len; i++) {
          let segment = "";
          while (part1[i] !== part3[part5]) {
            segment += part1[i];
            i++;
          }
          for (let j = 0; j < part3.length; j++) {
            segment = segment.replace(new RegExp(part3[j], "g"), j.toString());
          }
          part6 += String.fromCharCode(decodeSegment(segment, part5, 10) - part4);
        }
        return decodeURIComponent(encodeURIComponent(part6));
      }

      function extractParams(data) {
        return data.split("decodeURIComponent(escape(r))}(")[1].split("))")[0].split(",").map(item => item.replace(/"/g, "").trim());
      }

      function extractDownloadUrl(data) {
        return data.split("getElementById(\"download-section\").innerHTML = \"")[1].split("\"; document.getElementById(\"inputData\").remove(); ")[0].replace(/\\(\\)?/g, "");
      }

      function getVideoUrl(data) {
        return extractDownloadUrl(decodeData(extractParams(data)));
      }

      const response = await axios.post("https://snapsave.app/action.php?lang=id", "url=" + url, {
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "content-type": "application/x-www-form-urlencoded",
          origin: "https://snapsave.app",
          referer: "https://snapsave.app/id",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
        }
      });

      const data = response.data;
      const videoPageContent = getVideoUrl(data);
      const $ = cheerio.load(videoPageContent);
      const downloadLinks = [];

      $("div.download-items__thumb").each((index, item) => {
        $("div.download-items__btn").each((btnIndex, button) => {
          let downloadUrl = $(button).find("a").attr("href");
          if (!/https?:\/\//.test(downloadUrl || "")) {
            downloadUrl = "https://snapsave.app" + downloadUrl;
          }
          downloadLinks.push(downloadUrl);
        });
      });

      if (!downloadLinks.length) {
        return reject({
          msg: "No data found"
        });
      }

      return resolve({
        url: downloadLinks,
        metadata: {
          url: url
        }
      });
    } catch (error) {
      return reject({
        msg: error.message
      });
    }
  });
}

module.exports = async (fastify) => {
  fastify.get("/Instagram/igdl", { preHandler: validateApiKey }, async (request, reply) => {
    const { url } = request.query;

    if (!url) {
      return reply.status(400).send({ status: false, message: "URL is required" });
    }

    try {
      const result = await getDownloadLinks(url);
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({ status: false, message: error.msg || "Internal Server Error" });
    }
  });
};
