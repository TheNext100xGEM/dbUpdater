require('dotenv').config({ path: '.env.local'})
const db = require('./db')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))


const coinmarketcap = {

    getAllCoins: async () => {
    
        const CMC_HEADERS = {
            headers: {
                'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
            }
        }

        const getCoinInfo = async (coin) => {

            let coinInfo = await fetch(process.env.CMC_API+`/v2/cryptocurrency/info?id=${coin.id}`, CMC_HEADERS)

            coinInfo = await coinInfo.json()
            return coinInfo.data?.[coin.id] ?? (() => {
                
                console.log("CMC> Getting rate limited!"); 
                return {};
            })()
        }

        const getAllCoins = async () => {

            const CHUNK_SIZE = 5;
            const LIMIT = 5;

            let coins = await fetch(process.env.CMC_API+'/v1/cryptocurrency/map', CMC_HEADERS)

            coins = await coins.json()
            
            return (
                await Promise.all(
                    coins.data
                    .sort((a,b) => a.rank - b.rank)
                    .slice(0, LIMIT)
                    .map(
                        async coin => {

                            const CURRENT_CHUNK = Math.floor(coin.rank / CHUNK_SIZE);

                            await sleep(10000*CURRENT_CHUNK)
                            console.log('CMC > Loading chunk: ', CURRENT_CHUNK + ' / ' + Math.floor(LIMIT/CHUNK_SIZE))
                            
                            return {
                                ...coin,
                                ...( await getCoinInfo(coin) )
                            }
                        }
                    )
                )
            )
        }

        return await getAllCoins()
    },


    formatSale: (coin) => { // returns formatted version of sale

        return {
            uniqueKey: coin.contract_address?.[0]?.contract_address ?? (coin.symbol + '-' + 'cmc'),
            presaleAddress: 'none',
            tokenName: coin.name,
            tokenSymbol: coin.symbol,
            baseSymbol: coin?.platform?.symbol ?? coin?.symbol,
            saleToken: 'none',
            //audit: 'not provided', => If available, hydrate from website
            //auditLink: 'not provided',
            //kyc: 'not provided', => If available, hydrate from website
            safu: true,
            softCap: null,
            hardCap: null,
            amountRaised: null,
            telegramLink: coin.urls?.chat?.find(e => e.includes('https://telegram')) ?? 'none',
            discordLink: coin.urls?.chat?.find(e => e.includes('https://discord')) ?? 'none',
            twitterLink: coin.urls?.twitter?.[0] ?? 'none',
            websiteLink: coin.urls?.website?.[0] ?? 'none',
            submittedDescription: coin.description ?? 'none',
            githubLink: coin.urls?.source_code?.[0] ?? 'none',
            redditLink: coin.urls?.reddit?.[0] ?? 'none',
            logoLink: coin.logo,
            startTime: null,
            endTime: null,
            createdAt: new Date(coin.first_historical_data),
            poolType: 'FL',
            blockchain_area: coin.platform?.name ?? coin.name,
            chains: (coin.contract_address[0] ? coin.contract_address : [coin.name]).map(e => e.platform?.name ?? e),
            status: 2,
            telegramMemberCount: null,
            telegramOnlineCount: null,
            launchpad: 'not applicable',
            source: 'coinmarketcap',
            launchpads: ['not applicable'],
            isTrending: false
        }
    },
    getNonClosed: async () => { // returns formatted non-closed sales from coinmarketcap api
        try {
            
            return (await coinmarketcap.getAllCoins()).map(coinmarketcap.formatSale)
        } catch (e) {
            console.log(e)
        }
    },
    getNewTop: async () => {
        try {

            const alreadyIncluded = await db.getAllMinBySource('coinmarketcap')
            const nonClosedFromCMCApi = await coinmarketcap.getNonClosed()
            const toInclude = nonClosedFromCMCApi.filter(item => !alreadyIncluded.includes(item.uniqueKey) && item.safu)
            const toIncludeWithAnalyzedFalse = toInclude.map(item => ({...item, 'analyzed': false}))

            if (toIncludeWithAnalyzedFalse.length > 0) {
                await db.createListings(process.env.DB_COLL, toIncludeWithAnalyzedFalse)
            }
            return nonClosedFromCMCApi.filter(item => alreadyIncluded.includes(item.uniqueKey) && item.safu)
        } catch (e) {
            console.log(e)
        }
    },
}

module.exports = coinmarketcap