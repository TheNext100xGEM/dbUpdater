const db = require('./functions/db')
const pink = require('./functions/pink')
const gempad = require('./functions/gempad')
const cryptorank = require('./functions/cryptorank')
const certik = require('./functions/certik')

const helper = {
    run: {
        addPastCR : async () => {
            try {
                const all = await helper.cryptorank.getPast()
                const inDb = await helper.db.getAllMinBySource('cryptorank')

                let start = 2750
                let end = all.length

                let includeProd = []
                let includeRaw = []

                for (let i = start; i < end; i++) {
                    if (!inDb.includes(`${all[i].key}-cryptorank`)) {
                        const launchpads = all[i].launchpads.map(item => item.name)
                        const chains = all[i].blockchains.map(item => item.name)
                        console.log(i)

                        const single = await helper.cryptorank.getSingle(all[i].key)
                        const formatted = {...single.formatted, 'chains': chains, 'launchpads': launchpads, 'athRoi': all[i].athRoi}

                        console.log(formatted)
                        includeProd.push(formatted)
                        includeRaw.push(single.raw)
                        await new Promise(resolve => setTimeout(resolve, 1000))
                    }
                }

                if (includeProd.length > 0) {
                    console.log(includeProd.length)
                    await helper.db.createListings(process.env.DB_COLL, includeProd)
                }
                if (includeRaw.length > 0) {
                    console.log(includeRaw.length)
                    await helper.db.createListings(process.env.DB_COLL_RAW, includeRaw)
                }
                console.log(all.length)
            } catch (e) {
                console.log(e)
            }
        },
        getChainsFromCR : async () => {
            try {
                const cr = await helper.db.getBySource('cryptorank')
                const chains = cr.reduce((acc, cv) => {
                    if (cv.chains && Array.isArray(cv.chains)) {
                        cv.chains.forEach(chain => {
                            if (!acc.includes(chain)) {
                                acc.push(chain.trim())
                            }
                        })
                    }
                    return acc.sort()
                }, [])

                console.log(chains)
                return chains                
            } catch (e) {
                console.log(e)
            }
        },
        test : async () => {
            try {
                const all = await helper.certik.getSingleHtml('rehold')
                const links = helper.certik.parseHtml(all)
                console.log(links)
            } catch (e) {
                console.log(e)
            }
        },
    },
    db: db,
    pink: pink,
    gempad: gempad,
    cryptorank: cryptorank,
    certik: certik,
}