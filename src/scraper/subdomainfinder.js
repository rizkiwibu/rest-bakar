const axios = require("axios");
const cheerio = require("cheerio");

async function findSubdomains(domain) {
    const url = `https://crt.sh/?q=%25.${domain}&output=json`;
    const { data } = await axios.get(url);

    const subdomains = [
        ...new Set(data.map((item) => item.name_value).flatMap(v => v.split("\n")))
    ].filter(d => d.endsWith(domain));

    return {
        status: "success",
        domain,
        total: subdomains.length,
        subdomains
    };
}

module.exports = { findSubdomains };
