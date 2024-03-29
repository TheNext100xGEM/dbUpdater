const cheerio = require('cheerio')
const db = require('./db')

const certik = {
    checkUnique: async (launches) => {
        try {
            const socialsInDb = await db.getAllMinSocials()

            // compare on name
            const uniqueOnName = launches.filter(item => !socialsInDb.some(inDb => item.tokenName.toUpperCase() === inDb.tokenName.toUpperCase()))
            console.log('name', launches.length, uniqueOnName.length)
            // compare on website
            const uniqueOnWeb = uniqueOnName.filter(item => item.websiteLink).filter(item => !socialsInDb.some(inDb => item.websiteLink === inDb.websiteLink))
            console.log('web', uniqueOnName.length, uniqueOnWeb.length)
            const uniqueOnTw = uniqueOnWeb.filter(item => item.twitterLink).filter(item => !socialsInDb.some(inDb => item.twitterLink === inDb.twitterLink))
            console.log('tw', uniqueOnWeb.length, uniqueOnTw.length)

            return uniqueOnTw
        } catch (e) {
            console.log(e)
        }
    },
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
    parse: {
        cleanWebsiteLink: (website) => {
            try {
                if(!website.startsWith('/') &&
                !website.includes('scan')) 
                {
                    return website
                } else {
                    return undefined
                }
            } catch (e) {
                console.log(e)
            }
        },
        status: (html) => {
            try {
                const $ = cheerio.load(html)
                if ($('header').text().includes('Pre-Launch')) {
                    return 0
                } else {
                    return 4
                }
            } catch (e) {
                console.log(e)
                return undefined
            }
        },
        symbol: (html) => {
            try {
                const $ = cheerio.load(html)
                const headerText = $('header').text()
                const re = /\((\w+)\)/
                const match = headerText.match(re)
                if (match) {
                    return match[1]
                } else {
                    return undefined
                }
            } catch (e) {
                console.log(e)
            }
        },
        links: (html) => {
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

                const parsedLinks = {
                    websiteLink: certik.parse.cleanWebsiteLink(links[0]),
                    twitterLink: isolateAndCleanLink('twitter', links),
                    discordLink: isolateAndCleanLink('discord', links),
                    telegramLink: isolateAndCleanLink('t.me', links),
                    githubLink: isolateAndCleanLink('github', links),
                }

                return parsedLinks
            } catch (e) {
                console.log(e)
                return {}
            }
        },
    },
    parseHtml: (html) => {
        try {
            const $ = cheerio.load(html)
            const skynet = $('#skynet a')
            if (skynet.length > 0) { // proxy to check if proper html received
                const links = certik.parse.links(html)
                const status = certik.parse.status(html)
                const symbol = certik.parse.symbol(html)
                
                const parsed = {
                    ...links,
                    'status': status,
                    'tokenSymbol': symbol,
                }

                return parsed                
            } else {
                return {}
            }
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = certik