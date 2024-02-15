require('dotenv').config({ path: '.env.local'})
const db = require('./db')
const general = require('./general')
const fs = require('fs')
const path = require('path')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))


const dextools = {

    makeAuthedCall: async (url) => fetch(process.env.DEXTOOLS_API + url, {
        method: 'GET',
        headers: {
            'X-API-KEY': process.env.DEXTOOLS_API_KEY
        }
    }),
    

    formatSale: async (tokenAddress) => { // returns formatted version of sale
        try {
            await sleep(1000)
            let auditInfo = await dextools.makeAuthedCall(`/token/ether/${tokenAddress}/audit`)
            await sleep(1000)
            let allInfo = await dextools.makeAuthedCall(`/token/ether/${tokenAddress}`)
            
            allInfo = await allInfo.json()
            auditInfo = await auditInfo.json()

            if(!allInfo.data?.name) return false;

            let sale = {
                uniqueKey: tokenAddress,
                presaleAddress: 'none',
                tokenName: allInfo.data?.name,
                tokenSymbol: allInfo.data?.symbol,
                baseSymbol: 'ETH',
                saleToken: 'none',
                audit: false,
                auditLink: 'not provided',
                kyc: false,
                safu: auditInfo?.data?.isPotentiallyScam !== 'yes',
                softCap: null,
                hardCap: null,
                amountRaised: null,
                telegramLink: allInfo.data?.socialInfo?.telegram ?? 'none',
                twitterLink: allInfo.data?.socialInfo?.twitter ?? 'none',
                websiteLink: allInfo.data?.socialInfo?.website ?? 'none',
                submittedDescription: 'none',
                githubLink: allInfo.data?.socialInfo?.github ?? 'none',
                redditLink: allInfo.data?.socialInfo?.reddit ?? 'none',
                logoLink: 'none',
                startTime: null,
                endTime: null,
                createdAt: new Date(allInfo.data.creationTime),
                poolType: 'FL',
                chain: 1,
                chains: ["Ethereum"],
                status: 2,
                telegramMemberCount: null,
                telegramOnlineCount: null,
                launchpad: 'uniswap',
                source: 'dextools',
                launchpads: ['uniswap'],
                isTrending: true
            }
    
            return sale
        } catch (e) {
            console.log(e)
        }
    },
    getNonClosed: async () => { // returns formatted non-closed sales from dextools api
        try {
            let response = await dextools.makeAuthedCall(`/ranking/ether/hotpools`)
            let answer = await response.json() 
            // {data:[...], currentIndexes:[...], updatedAt: timeString}
            let sales = []

            for (let i = 0; i < await answer.data.length; i++) {
                console.log('> updating proj ' + i +' out of ' + answer.data.length)
                let newProject = await dextools.formatSale(answer.data[i].mainToken.address)

                if(newProject){
                    sales.push(await dextools.formatSale(answer.data[i].mainToken.address))
                }
                await sleep(1000)

            }

            return sales.filter(item => item !== undefined)
        } catch (e) {
            console.log(e)
        }
    },
    getSingleSale: async (search) => { // returns single searched formatted sale from dextools api
        try {
            let res = await fetch(`https://api.dextoolssale.finance/api/v1/pool/search?qs=${search}`);
            let ans = await res.json();
            return dextools.formatSale(ans.docs[0]) || undefined
        } catch (e) {
            console.log(e)
        }
    },
    getNewTrending: async () => {
        try {

            const alreadyIncluded = await db.getAllMinBySource('dextools')
            const nonClosedFromDextoolsApi = await dextools.getNonClosed()
            const toInclude = nonClosedFromDextoolsApi.filter(item => !alreadyIncluded.includes(item.uniqueKey) && item.safu)
            const toIncludeWithAnalyzedFalse = toInclude.map(item => ({...item, 'analyzed': false}))
            
            console.log('all: ', nonClosedFromDextoolsApi.length)
            console.log('toInclude: ', toInclude.length)
            if (toIncludeWithAnalyzedFalse.length > 0) {
                await db.createListings(process.env.DB_COLL, toIncludeWithAnalyzedFalse)
            }
            return nonClosedFromDextoolsApi.filter(item => alreadyIncluded.includes(item.uniqueKey) && item.safu)
        } catch (e) {
            console.log(e)
        }
    },
}

module.exports = dextools