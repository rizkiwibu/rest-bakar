const validateApiKey = require("../../middlewares/validateApiKey");

/**
 * @swagger
 * tags:
 *   name: Hitung Biaya Listrik
 *   description: Hitung estimasi biaya listrik perangkat berdasarkan volt dan ampere
 */

module.exports = async (fastify) => {
  /**
   * @swagger
   * /hitungBiayaListrik:
   *   get:
   *     summary: Hitung estimasi biaya listrik
   *     tags: [Hitung Biaya Listrik]
   *     parameters:
   *       - name: volt
   *         in: query
   *         required: true
   *         schema:
   *           type: number
   *         description: Tegangan adaptor (Volt)
   *       - name: ampere
   *         in: query
   *         required: true
   *         schema:
   *           type: number
   *         description: Arus adaptor (Ampere)
   *       - name: jamPerHari
   *         in: query
   *         required: false
   *         schema:
   *           type: number
   *         description: Jam pemakaian per hari (default 24)
   *       - name: hari
   *         in: query
   *         required: false
   *         schema:
   *           type: number
   *         description: Jumlah hari dalam sebulan (default 30)
   *       - name: pajakPeneranganJalan
   *         in: query
   *         required: false
   *         schema:
   *           type: number
   *         description: Persentase Pajak Penerangan Jalan (default 5)
   *       - name: apikey
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: API key untuk autentikasi
   *     responses:
   *       200:
   *         description: Estimasi biaya listrik berhasil dihitung
   *       400:
   *         description: Parameter tidak lengkap
   *       403:
   *         description: API key tidak valid
   */
  
  fastify.get("/hitungBiayaListrik", { preHandler: validateApiKey }, async (req, reply) => {
    const { volt, ampere, jamPerHari = 24, hari = 30, pajakPeneranganJalan = 5 } = req.query;

    if (!volt || !ampere) {
      return reply.code(400).send({
        status: "error",
        message: "Parameter 'volt' dan 'ampere' wajib diisi."
      });
    }

    const dayaWatt = parseFloat(volt) * parseFloat(ampere);
    const dayaKW = dayaWatt / 1000;
    const totalKWh = dayaKW * jamPerHari * hari;
    const tarifPerKWh = 1444.70;
    const biaya = totalKWh * tarifPerKWh;
    const pajak = (pajakPeneranganJalan / 100) * biaya;
    const total = Math.round(biaya + pajak);

    return {
      status: "success",
      volt: parseFloat(volt),
      ampere: parseFloat(ampere),
      dayaWatt,
      totalKWh: parseFloat(totalKWh.toFixed(3)),
      estimasiBiayaTanpaPajak: Math.round(biaya),
      persentasePajakPeneranganJalan: pajakPeneranganJalan,
      nilaiPajakPeneranganJalan: parseFloat(pajak.toFixed(2)),
      totalBiayaDenganPajak: total
    };
  });
};
