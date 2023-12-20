require('dotenv').config({ path: '.env.local'})
const db = require('./db')
const general = require('./general')

const gempad = {
    fetchOptions: {
        headers: {
            cookie: `api_key=${process.env.GEMPAD_KEY}`
        }
    },
    convertChainToId: (chain) => {
        if (chain == 'Ethereum') {return '1'}
        if (chain == 'BSC') {return '56'}
        if (chain == 'Telos') {return '40'}
        if (chain == 'Polygon') {return '137'}
        if (chain == 'Cronos') {return '25'}
        if (chain == 'Dogechain') {return '2000'}
        if (chain == 'Alvey') {return '3797'}
        if (chain == 'Arbitrum') {return '42161'}
        if (chain == 'Core') {return '1116'}
        if (chain == 'PulseChain') {return '369'}
        if (chain == 'Base') {return '8453'}
        if (chain == 'opBNB') {return '204'}
        if (chain == 'Shibarium') {return '109'}
        if (chain == 'MaxxChain') {return '10201'}
    },
    formatChainString: (chain) => {
        if (chain == 'BSC') {return 'BNB'}
        else {return chain}
    },
    formatIdToChain: (id) => {
        try {
            switch (id) {
                case 1: return 'Ethereum'
                case 56: return 'BNB'
                case 40: return 'Telos'
                case 137: return 'Polygon'
                case 25: return 'Cronos'
                case 2000: return 'Dogechain'
                case 3797: return 'Alvey'
                case 42161: return 'Arbitrum'
                case 1116: return 'Core'
                case 369: return 'PulseChain'
                case 8453: return 'Base'
                case 204: return 'opBNB'
                case 109: return 'Shibarium'
                case 10201: return 'MaxxChain'
                default: return null
                }
        } catch (e) {
            console.log(e)
        }
    },
    getNonClosedFromLw: async () => {
        try {
            let response = await fetch(process.env.GEM_NON_CLOSED)
            let answer = await response.json()

            return answer
        } catch (e) {
            console.log(e)
        }
    },
    getPoolFromLw: async (presaleAddress) => {
        try {
            let response = await fetch(`${process.env.GEM_FROM_LW}?pa=${presaleAddress}`)
            let answer = await response.json()

            return answer
        } catch (e) {
            console.log(e)
        }
    },
    getNonClosed: async () => {
        try {
            let response = await fetch(process.env.GEM_NON_CLOSED)
            let answer = await response.json()
            const formattedSales = []
            
            for (let i = 0; i < answer.length; i++) {
                let poolFromGem = await gempad.getSingleSale(answer[i].presaleAddress, gempad.convertChainToId(answer[i].chain), answer[i].poolType == "special" ? true : false)
                const formatted = gempad.formatSingleSale(poolFromGem, answer[i])
                formattedSales.push(formatted)
                await new Promise(resolve => setTimeout(resolve, 500))
            }
            
            return formattedSales
        } catch (e) {
            console.log(e)
        }
    },
    getSingleSale: async (saleAddress, chainId, isSpecialSale) => {
        try {
            let response = await fetch(`https://gempad.app/api/${chainId}/${isSpecialSale ? "special-pool-api" : "pool-api"}/${saleAddress}`, gempad.fetchOptions)
            let answer = await response.json()
            return answer
        } catch (e) {
            console.log(e)
        }
    },
    formatSingleSale: (poolFromGem, poolFromLw) => {
        try {
            let sale = {
                'uniqueKey': poolFromLw.presaleAddress,
                'launchpad': 'gempad',
                'source': 'gempad',
                'launchpads': ['GemPad'],
                'presaleAddress': poolFromLw.presaleAddress,
                'presaleLink': poolFromLw.presaleLink,
                'chains': [gempad.formatChainString(poolFromLw.chain)],
                'startTime': poolFromLw.startTime,
                'endTime': poolFromLw.endTime,
                'softCap': poolFromLw.softCap,
                'hardCap': poolFromLw.hardCap,
                'saleToken': poolFromLw.saleToken,
                'kyc': poolFromLw.kyc,
                'audit': poolFromLw.audit,
                'telegramLink': poolFromLw.telegramLink,
                'twitterLink': poolFromLw.twitterLink,
                'websiteLink': poolFromLw.websiteLink,
                'status': poolFromLw.status,
                'tokenSymbol': poolFromLw.tokenSymbol,
                'tokenName': poolFromLw.tokenName,
                'baseSymbol': poolFromLw.baseTokenSymbol,
                'websiteLink': poolFromGem.pool.ipfs ? poolFromGem.pool.ipfs.website : undefined,
                'submittedDescription': poolFromGem.pool.ipfs ? poolFromGem.pool.ipfs.description : undefined,
                'githubLink': poolFromGem.pool.ipfs ? poolFromGem.pool.ipfs.github : undefined,
                'logoLink': poolFromGem.pool.ipfs ? poolFromGem.pool.ipfs.logo : undefined,
                'auditLink': poolFromGem.pool.auditLink,
                'createdAt': Date.parse(poolFromGem.pool.createdAt)
            }
            return sale
        } catch (e) {
            console.log(e)
        }
    },
    statusUpdate: async () => {
        try {
            let nonClosedFromDb = await db.getNonClosedBySource('gempad')
            let nonClosedFromGemApi = await gempad.getNonClosed()
            let fromGemObject = general.arrayToObject(nonClosedFromGemApi, 'presaleAddress')

            for (let i = 0; i < nonClosedFromDb.length; i++) {
                if (fromGemObject[nonClosedFromDb[i].presaleAddress] !== undefined) {
                    if (nonClosedFromDb[i].status !== fromGemObject[nonClosedFromDb[i].presaleAddress].status) { // if status different
                        console.log('in api and status different', nonClosedFromDb[i], fromGemObject[nonClosedFromDb[i].presaleAddress])
                        await db.updateListing({'presaleAddress': nonClosedFromDb[i].presaleAddress}, {'status': fromGemObject[nonClosedFromDb[i].presaleAddress].status})
                    }
                } else { // not in gem api anymore (so either status = 2,3,4)
                    let poolFromLw = await gempad.getPoolFromLw(nonClosedFromDb[i].presaleAddress)
                    console.log('not in api and status different', nonClosedFromDb[i], poolFromLw)                                                
                    await db.updateListing({'presaleAddress': nonClosedFromDb[i].presaleAddress}, {'status': poolFromLw.status})
                }
            }
        } catch (e) {
            console.log(e)
        }
    },
    checkNew: async () => {
        try {
            const alreadyIncluded = await db.getAllMinBySource('gempad')
            const nonClosedFromGemApi = await gempad.getNonClosed()
            
            const toInclude = nonClosedFromGemApi.filter(item => !alreadyIncluded.includes(item.presaleAddress) && item.audit && item.kyc)
            const toIncludeWithAnalyzedFalse = toInclude.map(item => ({...item, 'analyzed': false}))
            console.log(toIncludeWithAnalyzedFalse)
            if (toIncludeWithAnalyzedFalse.length > 0) {
                // await db.createListings(process.env.DB_COLL, toIncludeWithAnalyzedFalse)
            }
        } catch (e) {
            console.log(e)
        }
    },
}

module.exports = gempad