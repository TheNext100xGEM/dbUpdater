const db = require('./db')
const extractUrls = require('extract-urls')

const dex = {
    getAllLinks: (text) => {
        try {
            return extractUrls(text) || []
        } catch (e) {
            console.log(e)
            return []
        }
    },
    extractTelegram: (links) => {
        try {
            const matched = []
            for (let i = 0; i < links.length; i++) {
                if (links[i].includes('t.me/')) {
                    matched.push(links[i])
                }
            }
            return matched            
        } catch (e) {
            console.log(e)
            return []
        }
    },
    extractTwitter: (links) => {
        try {
            const matched = []
            for (let i = 0; i < links.length; i++) {
                if (links[i].includes('twitter.com/') || links[i].includes('x.com/')) {
                    matched.push(links[i])
                }
            }
            return matched            
        } catch (e) {
            console.log(e)
            return []
        }
    },
    getAddress: async (pair) => {
        try {
            const ans = await fetch(`https://api.dexscreener.com/latest/dex/pairs/ethereum/${pair}`)
            const res = await ans.json()
            return res.pairs[0].baseToken.address
        } catch (e) {
            console.log(e)
        }
    },
    getSourceCode: async (token) => {
        try {
            const ans = await fetch(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${token}&apikey=${process.env.ETHERSCAN_KEY}`)
            const res = await ans.json()
            return res.result[0].SourceCode
        } catch (e) {
            console.log(e)
            return 'no'
        }
    },
    getSocialLinks: async (pair) => {
        try {
            const token = await helperExtract.getAddress(pair)
            const sourceCode = await helperExtract.getSourceCode(token)
            const allLinks = helperExtract.getAllLinks(await sourceCode)
            return {
                tg: helperExtract.extractTelegram(allLinks),
                tw: helperExtract.extractTwitter(allLinks)
            }
        } catch (e) {
            console.log(e)
        }
    },
}

module.exports = dex