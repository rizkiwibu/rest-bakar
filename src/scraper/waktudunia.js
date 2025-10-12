const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone');
async function waktu() {
    const url = 'https://onlinealarmkur.com/world/id/';
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let hasil = [];
        $('.flex.items-center.space-x-3').each((index, element) => {
            const bndera = $(element).find('.avatar .text-2xl').text().trim();
            const kota = $(element).find('.city-name').text().trim();
            const Zona = $(element).find('.city-time').attr('data-tz');
            if (Zona) {
                const realTime = moment().tz(Zona).format('ddd - HH:mm');
                hasil.push({ bndera, kota, waktu: realTime });
            }
        });
        return hasil;
    } catch (error) {
        return [];
    }
}

module.exports = waktu;