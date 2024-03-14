require('dotenv').config({ path: '../.env'})


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const CMC_HEADERS = {
    headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
    }

}

const getCoinInfo = async (coin) => {

    let coinInfo = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${coin.id}`, CMC_HEADERS)

    coinInfo = await coinInfo.json()
    return coinInfo.data?.[coin.id] ?? (() => {
        console.log("Getting rate limited!"); 
        return {};
    })()
}

const getAllCoins = async () => {

    const CHUNK_SIZE = 5;
    const LIMIT = 500;

    let coins = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/map', CMC_HEADERS)
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
                    console.log('Loading chunk: ', CURRENT_CHUNK + ' / ' + Math.floor(LIMIT/CHUNK_SIZE))
                    
                    return {
                        ...coin,
                        ...( await getCoinInfo(coin) )
                    }
                }
            )
        )
    )

}


const start = async() => {

    let coins = await getAllCoins()

    console.dir(coins, {depth: null})
}
start()