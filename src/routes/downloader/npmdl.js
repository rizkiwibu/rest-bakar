const axios = require('axios');


/**
 * @swagger
 * /npm/search:
 *   get:
 *     summary: Search for NPM packages
 *     tags:
 *       - NPM
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The keyword to search for NPM packages
 *     responses:
 *       200:
 *         description: Successfully fetched NPM package search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Name of the package
 *                         example: "express"
 *                       description:
 *                         type: string
 *                         description: Description of the package
 *                         example: "Fast, unopinionated, minimalist web framework for Node.js"
 *                       version:
 *                         type: string
 *                         description: The latest version of the package
 *                         example: "4.17.1"
 *                       link:
 *                         type: string
 *                         description: URL to the NPM package page
 *                         example: "https://www.npmjs.com/package/express"
 *       400:
 *         description: Missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /npm/download:
 *   get:
 *     summary: Get download link for NPM package
 *     tags:
 *       - NPM
 *     parameters:
 *       - in: query
 *         name: pkg
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the NPM package
 *       - in: query
 *         name: pkgver
 *         required: true
 *         schema:
 *           type: string
 *         description: The version of the package
 *     responses:
 *       200:
 *         description: Successfully fetched download link for the NPM package
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 package:
 *                   type: string
 *                   description: The name of the package
 *                   example: "express"
 *                 version:
 *                   type: string
 *                   description: The version of the package
 *                   example: "4.17.1"
 *                 download_url:
 *                   type: string
 *                   description: The direct download URL of the package's tarball
 *                   example: "https://registry.npmjs.org/express/-/express-4.17.1.tgz"
 *       400:
 *         description: Missing or invalid `pkg` or `pkgver` parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: The requested package or version could not be found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */


/**
 * Function to search for NPM packages.
 * 
 * @param {string} query - The search keyword.
 * @returns {object} - Returns an array of search results.
 */
async function npmSearch(query) {
  try {
    // Call NPM Registry API to search packages by query
    const response = await axios.get('https://registry.npmjs.org/-/v1/search', {
      params: {
        text: query,
        size: 10,  // Limit the number of results to 10 for example
        quality: 1,
        popularity: 1,
        maintenance: 1
      }
    });

    const packages = response.data.objects.map(pkg => ({
      name: pkg.package.name,
      description: pkg.package.description,
      version: pkg.package.version,
      link: `https://www.npmjs.com/package/${pkg.package.name}`
    }));

    return {
      status: true,
      data: packages
    };
  } catch (error) {
    return { status: false, message: `Error: ${error.message}` };
  }
}

/**
 * Function to get the download link of an NPM package.
 * 
 * @param {string} pkg - Package name.
 * @param {string} pkgver - Package version.
 * @returns {object} - Download link or error message.
 */
async function getNpmDownloadLink(pkg, pkgver) {
  try {
    const downloadUrl = `https://registry.npmjs.org/${pkg}/-/${pkg}-${pkgver}.tgz`;

    // Check if the URL is valid by attempting a HEAD request
    const response = await axios.head(downloadUrl);

    if (response.status === 200) {
      return {
        status: true,
        package: pkg,
        version: pkgver,
        download_url: downloadUrl
      };
    } else {
      return { status: false, message: 'Download link not available.' };
    }
  } catch (error) {
    return { status: false, message: `Error: ${error.message}` };
  }
}

/**
 * API endpoints for NPM Search and Get Download Link.
 */
module.exports = async (fastify) => {
  // Endpoint for searching NPM packages
  fastify.get("/npm/search", async (request, reply) => {
    const { query } = request.query;

    if (!query) {
      return reply.status(400).send({ status: false, message: "Search query is required" });
    }

    try {
      const result = await npmSearch(query);

      if (result.status) {
        return reply.status(200).send(result);
      } else {
        return reply.status(404).send(result);
      }
    } catch (err) {
      return reply.status(500).send({ status: false, message: "Error searching the NPM packages." });
    }
  });

  // Endpoint for downloading NPM package by version
  fastify.get("/npm/download", async (request, reply) => {
    const { pkg, pkgver } = request.query;

    // Validate parameters
    if (!pkg || !pkgver) {
      return reply.status(400).send({ status: false, message: "Package name and version are required" });
    }

    try {
      const result = await getNpmDownloadLink(pkg, pkgver);

      if (result.status) {
        return reply.status(200).send(result);
      } else {
        return reply.status(404).send(result);
      }
    } catch (err) {
      return reply.status(500).send({ status: false, message: "Error fetching the package download link." });
    }
  });
};
