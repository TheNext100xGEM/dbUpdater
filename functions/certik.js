const cheerio = require('cheerio')

const certik = {
    getSingleHtml: async (key) => {
        try {
            let response = await fetch(`https://skynet.certik.com/projects/${key}`)
            let answer = await response.text()
            
            return answer
        } catch (e) {
            console.log(e)
        }
    },
    parseHtml: (html) => {
        try {
            const $ = cheerio.load(html)
            const skynet = $('#skynet a')
            const links = []
            skynet.each((i, el) => {
                const link = $(el).attr('href')
                links.push(link)
            })

            const isolateAndCleanLink = (source, links) => {
                try {
                    const raw = links.filter(item => item.includes(source))
                    if (raw.length > 0) {
                        return raw[0].replace('?utm_source=certik', '')
                    } else {
                        return undefined
                    }
                } catch (e) {
                    console.log(e)
                }
            }

            const parsedData = {
                websiteLink: links[0],
                twitterLink: isolateAndCleanLink('twitter', links),
                discordLink: isolateAndCleanLink('discord', links),
                telegramLink: isolateAndCleanLink('t.me', links),
                githubLink: isolateAndCleanLink('github', links),
            }

            return parsedData
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = certik