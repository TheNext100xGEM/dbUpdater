require('dotenv').config();

const requests = require('./lib/proxyreq.js')


/*
const extractURL = (html) => {
    const dom = new JSDOM(html);
    const document = dom.window.document;
  
    // Assuming the <a> tag is always within a div with class "sc-d8888a34-0 ewoqBa"
    const container = document.querySelector('.sc-d8888a34-0.ewoqBa');
  
    if (container) {
        const link = container.querySelector('a');
        return link ? link.href : "URL not found";
    } else {
        return "Container not found";
    }
  }

const getRaw = async () => {

    let cr_ranking = await fetch('https://cryptorank.io/price/saga-genesis')
    let html = await cr_ranking.text()

    const dom = new JSDOM(html);

    const contractAddressesContainer = dom.window.document.getElementsByClassName('contracts')[0]
    const url = extractURL(contractAddressesContainer.innerHTML);
    console.log(url)
}
*/

const ChainStandards = {
    "Binance Smart Chain": "BNB",
}


const getCoinInfo = async (tokenName) => {
    const rawResponse = await requests.getJSON('https://api.cryptorank.io/v0/coins/'+tokenName)

    if(!rawResponse.status){
        return {
            status: false,
            message: "Error fetching coin info"
        }
    }

    const response = JSON.parse(rawResponse.data)

    if(!response.data)
        return {
            status: false,
            message: "Coin not found"
        }

    const { 
        tokens,
        links,
        name
    } = response.data;
    
    const explorerLink = links.find(Link => Link.type === 'explorer')?.value

    let isCustomChain = !tokens[0]

    console.log(explorerLink)
    if(explorerLink)
        isCustomChain = !explorerLink.startsWith(tokens[0]?.explorerUrl)


    return {
        status: true,
        chains: !isCustomChain ? tokens.map(token => token.platformName) : [name],
        uniqueKey: tokens[0]?.address || name,
    }

}


const start = async () => {
    const coinInfo = await getCoinInfo('graphlinq-protocol')
    console.log(coinInfo)

}

start()