const db = require('./db')
const general = require('./general')

const cryptorank = {
    getKeyFromUnique: (uniqueKey) => {
        try {
            return uniqueKey.slice(0, -11)
        } catch (e) {
            console.log(e)
        }
    },
    formatStatus: (status) => {
        try {
            if (status == 'upcoming') {return 0}
            if (status == 'active') {return 1}
            if (status == 'past') {return 2}
        } catch (e) {
            console.log(e)
        }
    },
    getUpcoming: async () => {
        try {
            let response = await fetch('https://api.cryptorank.io/v0/round/upcoming', {
                method: 'POST',
            })
            let answer = await response.json()
            // console.log(answer.data)
            let formatted = []

            for (let i = 0; i < answer.data.length; i++) {
                const launchpads = answer.data[i].launchpads.map(item => item.name)
                const chains = answer.data[i].blockchains.map(item => item.name)
                const single = await cryptorank.getSingle(answer.data[i].key)
                const formattedSingle = {...single.formatted, 'chains': chains, 'launchpads': launchpads}
                formatted.push(formattedSingle)
                console.log(i, '/', answer.data.length)
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            return formatted
        } catch (e) {
            console.log(e)
        }
    },
    getPast: async () => {
        try {
            let response = await fetch('https://api.cryptorank.io/v0/round/past', {
                method: 'POST',
            })
            let answer = await response.json()
            const withStatus = []

            for (let i = 0; i < answer.data.length; i++) {
                let elementWithStatus = answer.data[i]
                elementWithStatus.icoStatus = 'past'
                withStatus.push(elementWithStatus)
            }

            return withStatus
        } catch (e) {
            console.log(e)
        }
    },
    getSingleRaw: async (key) => {
        try {
            let response = await fetch(`https://api.cryptorank.io/v0/coins/${key}?locale=en`)
            let answer = await response.json()
            let single = answer.data

            return single
        } catch (e) {
            console.log(e)
        }
    },
    getSingle: async (key) => {
        try {
            let response = await fetch(`https://api.cryptorank.io/v0/coins/${key}?locale=en`)
            let answer = await response.json()
            let single = answer.data
            // console.log(single)

            let formattedIco = {
                uniqueKey: `${single.key}-cryptorank`,
                tokenName: single.name,
                tokenSymbol: single.symbol,
                websiteLink: single.links.find(item => item.type == "web")?.value,
                twitterLink: single.links.find(item => item.type == "twitter")?.value,
                whitepaperLink: single.links.find(item => item.type == "whitepaper")?.value,
                telegramLink: single.links.find(item => item.type == "telegram")?.value,
                githubLink: single.links.find(item => item.type == "github")?.value,
                gitbookLink: single.links.find(item => item.type == "gitbook")?.value,
                submittedDescription: single.description,
                status: cryptorank.formatStatus(single.icoStatus),
                icoStatus: single.icoStatus,
                initialMarketCap: single.initialMarketCap || undefined,
                athMarketCap: single.athMarketCap?.USD || undefined,
                logoLink: single.image?.x150,
                category: single.category,
                source: 'cryptorank',
                analyzed: false
            }

            return {'formatted': formattedIco, 'raw': {...single, 'callType': 'single'}}
        } catch (e) {
            console.log(e)
        }
    },
    statusUpdate: async () => {
        try {
            let nonClosedFromDb= await db.getNonClosedBySource('cryptorank')
            let nonClosedFromCRApi = await cryptorank.getUpcoming()
            let fromCRObject = general.arrayToObject(nonClosedFromCRApi, 'uniqueKey')

            for (let i = 0; i < nonClosedFromDb.length; i++) {
                if (fromCRObject[nonClosedFromDb[i].uniqueKey] !== undefined) { // still in cryptorank api (so either status = 0,1)
                    if (nonClosedFromDb[i].status !== fromCRObject[nonClosedFromDb[i].uniqueKey].status) { // if status different
                        console.log('in api and status different', nonClosedFromDb[i], fromCRObject[nonClosedFromDb[i].uniqueKey])
                        await db.updateListing({'uniqueKey': nonClosedFromDb[i].uniqueKey}, {'status': fromCRObject[nonClosedFromDb[i].uniqueKey].status})
                    }
                } else { // not in api anymore (so either status = 2,3,4)
                    let sale = await cryptorank.getSingle(cryptorank.getKeyFromUnique(nonClosedFromDb[i].uniqueKey))
                    console.log('not in api and status different', nonClosedFromDb[i], sale.formatted)                                                
                    await db.updateListing({'uniqueKey': nonClosedFromDb[i].uniqueKey}, {'status': sale.formatted.status})
                    await new Promise(resolve => setTimeout(resolve, 500))
                }
            }
        } catch (e) {
            console.log(e)
        }
    },
    checkNew: async () => {
        try {
            const alreadyIncluded = await db.getAllMinBySource('cryptorank')
            const nonClosedFromCRApi = await cryptorank.getUpcoming()
            
            const toInclude = nonClosedFromCRApi.filter(item => !alreadyIncluded.includes(item.uniqueKey))
            console.log(toInclude)
            if (toInclude.length > 0) {
                await db.createListings(process.env.DB_COLL, toInclude)
            }
        } catch (e) {
            console.log(e)
        }
    },
}

module.exports = cryptorank