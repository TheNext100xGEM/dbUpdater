const cheerio = require('cheerio')

const certik = {
    getUpcomingBatch: async (limit, skip) => { // {items: [...], page: {limit, total, hasMore}}
        try {
            let response = await fetch(`https://skynet.certik.com/api/leaderboard-all-projects/query-leaderboard-pre-launch-projects?limit=${limit}&skip=${skip}`)
            let answer = await response.json()
            
            return answer
        } catch (e) {
            console.log(e)
        }
    },
    getUpcomingAll: async (limit) => { // info from upcoming
        try {
            const all = []
            const first = await certik.getUpcomingBatch(limit, 0)
            all.push(...first.items)
            const numBatches = first.page.total / limit
            if (numBatches > 1) {
                for (let i = 1; i <= numBatches; i++) {
                    let batch = await certik.getUpcomingBatch(limit, limit*i)
                    all.push(...batch.items)
                    console.log(i)
                    await new Promise(resolve => setTimeout(resolve, 3000))
                }
            }
            return all
        } catch (e) {
            console.log(e)
        }
    },
    getUpcomingAllExtra: async (limit) => { // with extra info from parsed page for each launch
        try {
            const nonFormatted = await certik.getUpcomingAll(limit)
            const formatted = []
            for (let i = 0; i < nonFormatted.length; i++) {
                let single = certik.formatUpcomingSingle(nonFormatted[i])
                const html = await certik.getSingleHtml(nonFormatted[i].id)
                const extraInfo = certik.parseHtml(html) 
                single = {...single, ...extraInfo}
                formatted.push(single)
                console.log(i, nonFormatted.length, single)
                await new Promise(resolve => setTimeout(resolve, 4000))
            }
            return formatted
        } catch (e) {
            console.log(e)
        }
    },
    formatUpcomingSingle: (single) => {
        try {
            let formatted = {
                source: 'certik',
                uniqueKey: `${single.id}-certik`,
                tokenName: single.name.trim(),
                tokenSymbol: single.tokenTickers && (single.tokenTickers.length > 0 ? single.tokenTickers[0] : undefined),
                createdAt: Date.parse(single.createdAt),
                logoLink: single.contentfulLogo,
                status: 0,
                chains: single.platforms, // requires format
                audit: single.audits && single.audits.length > 0 || false,
                kyc: !single.kycAssessment,
            }
            return formatted
        } catch (e) {
            console.log(e)
        }
    },
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