const axios = require('axios');
const validateApiKey = require("../../middlewares/validateApiKey"); // Import middleware

module.exports = async (fastify) => {
    /**
     * @swagger
     * /Instagram/igSearch:
     *   get:
     *     summary: Mencari profil Instagram berdasarkan username menggunakan API eksternal
     *     tags: 
     *       - Instagram
     *     parameters:
     *       - name: username
     *         in: query
     *         required: true
     *         description: Username Instagram yang akan dicari
     *         schema:
     *           type: string
     *       - name: apikey
     *         in: query
     *         required: true
     *         description: API key untuk autentikasi
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Berhasil mendapatkan hasil pencarian profil
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   description: Status respons
     *                 result:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                     description:
     *                       type: string
     *                     followers:
     *                       type: integer
     *                     uploads:
     *                       type: integer
     *                     engagementRate:
     *                       type: number
     *                     averageActivity:
     *                       type: number
     *                     postsPerDay:
     *                       type: integer
     *                     postsPerWeek:
     *                       type: integer
     *                     postsPerMonth:
     *                       type: integer
     *                     mostPopularPostTime:
     *                       type: string
     *                     hashtags:
     *                       type: array
     *                       items:
     *                         type: string
     *                     mostCommentedPosts:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           comments:
     *                             type: integer
     *                           likes:
     *                             type: integer
     *                           link:
     *                             type: string
     *                     mostLikedPosts:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           comments:
     *                             type: integer
     *                           likes:
     *                             type: integer
     *                           link:
     *                             type: string
     *       400:
     *         description: Username tidak boleh kosong
     *       403:
     *         description: API key tidak valid
     *       500:
     *         description: Terjadi kesalahan server
     */
    fastify.get("/Instagram/igSearch", { preHandler: validateApiKey }, async (req, reply) => {
        const { username } = req.query;

        // Validasi username
        if (!username) {
            return reply.code(400).send({
                status: "error",
                message: "Username tidak boleh kosong!"
            });
        }

        try {
            // Memanggil API eksternal untuk mendapatkan data profil Instagram
            const response = await axios.get(`https://fastrestapis.fasturl.cloud/stalk/instagram?username=${username}`);
            
            // Memastikan API eksternal mengembalikan status 200
            if (response.status === 200) {
                const data = response.data.result;

                // Mengirimkan hasil pencarian profil Instagram dalam format yang lebih mudah dibaca
                return reply.code(200).send({
                    status: "success",
                    result: {
                        name: data.name,
                        description: data.description,
                        followers: data.followers,
                        uploads: data.uploads,
                        engagementRate: data.engagementRate,
                        averageActivity: data.averageActivity,
                        postsPerDay: data.postsPerDay,
                        postsPerWeek: data.postsPerWeek,
                        postsPerMonth: data.postsPerMonth,
                        mostPopularPostTime: data.mostPopularPostTime,
                        hashtags: data.hashtags,
                        mostCommentedPosts: data.mostCommentedPosts.map(post => ({
                            comments: post.comments,
                            likes: post.likes,
                            link: post.link
                        })),
                        mostLikedPosts: data.mostLikedPosts.map(post => ({
                            comments: post.comments,
                            likes: post.likes,
                            link: post.link
                        }))
                    }
                });
            } else {
                return reply.code(500).send({
                    status: "error",
                    message: "Terjadi kesalahan saat mengakses API eksternal"
                });
            }
        } catch (error) {
            // Menangani error jika terjadi kesalahan dalam memanggil API eksternal
            return reply.code(500).send({
                status: "error",
                message: "Terjadi kesalahan server",
                error: error.message
            });
        }
    });
};
