require('dotenv').config({ path: '.env.local'})
const db = require('./db')
const general = require('./general')
const fs = require('fs')
const path = require('path')


const pink = {
    banned: [ // sales I noticed that shouldn't be returned by the api but still are
        '0x0280D51A12e94f3Cbd02dd31a9c8e94060EB598B',
        '0x0413564bC280f4ba124eF700cB0b7987c4AC2dac',
        '0xA995725B69DaB0853fE77A9e823C3088407C6386',
        '0xC2F06E2C1d8f3583635Dd6857dCbE0782f6F23B7',
        '0xA0bC7c7C4bbf8738363d00bF24CAfB410FDfB036',
        '0xC7E799DD1EE0722ac1f00478370b336C8371AE52',
        '0xB45722383a8877Eabc059e535647B1ad93E5F65C',
        '0xcb0e3177E683544C1AA4ABc01fc5b446f47297eC',
        '0x5595d4Eec642791549e90610a0728FE9944AA489',
        '0x38DD2C305abafaEA9Bbd09B7A10fEfA8b8d12B7F',
        '0xA76566941443f00cb99c40b1ee0310256342a757',
        '0x2356331Ee7D1CE857Bf4D87aCdb5095Af33AF481',
        '0x04Eb1C176359C5a1AB20Ea3d1c4Aaea63685663c',
        '0xf1971BBd4fa2BFC2Abc84Afd851c1129f982cE75',
        '0xf5c842B96f112Ad3C5E50a1D81f3a3456B6b4406',
        '0x34C265022282F9aB647422FAe0945c5B62AFcDca',
        '0x0D7E4Ef02b5CA38fbD57c32f01e3fC15EbeE7cC5',
        '0x6061b20760A33C28ECdd7C5739d4Fb008Ef17115',
        '0xDa2c6C9f5c8032520d0b4407D80b05803B157AA1',
        '0x4f6E96C48E164372bC02D1905Bb9bf3f4EB43647',
        '0xb483E89EcD7B8B4b22876584824305e45AACc59d',
        '0x73bEcA53cDf65f903Cad519bF4cf8C4DFa8082Ac',
        '0xCa57606e4786a73C2E996f6B0FD728b74d588C96',
        '0x73F633831972e6Bf9A8EE9bA34ea5E3B128EFbf7',
        '0x4d867BD10F2D73d75d43F312fa53d9809B17E03B',
        '0xc57925340CdCbF59E1648701769476E281ff17ED',
        '0xcA1c08f32A80c1DDE882227208515De8fA1ee218',
        '0x4a4D02B3039DA6049792F91108f210c3D346e351',
        '0xF8f69F253d31F6a860227f95C38c47ed2F708327',
        '0xd5A48080fB745D96559a4446E657b563c608972F',
        '0xAa252e53d18356F5972A44019f121d2075c74197',
        '0x047818ef8382c26Ff126358E0Bb399F3fE7dA18B',
        '0xe400054aC8045763d7d01b89dA37720340834CFa',
        '0x8E845dBdF7f8CCA0E501B27cBf43833fF48a3F44',
        '0x5c48de03DAFd56B19832fab7265A4d129c4553E8',
        '0xf9FAd3c80e64449Cd57D10ADFE71C8e3669ca54a',
        '0x7EbFe3EBe88b7E535Baee6c1Fe3bC41218b0244A',
        '0x7CF724e4835257Fb74134Ef5e28f813acf4b55b5',
        '0xE23C44Ea3029bF99709B52a99fC6427316DB5A10',
        '0x3Bc25D85e6B9BD837e2A50f1C9d8F84308fFB84E',
        '0x29024380F148C14bE48582799Ae2DbEB38836528',
        '0x9ae9e7FcC6EF3aeE152083C4E008ECEeD221b24d',
        '0x3e87172d8c67B8673FeD025D96A28EDc966d48f5',
    ],
    chains: [1, 56, 42161],
    formatChain: (chainId) => {
        if (chainId === 1) {return 'Ethereum'}
        if (chainId === 56) {return 'BNB'}
        if (chainId === 42161) {return 'Arbitrum'}
    },
    getStatus: (sale) => { // 0: upcoming, 1: open, 2: filled, 3: failed, 4: launched
        try {
            const now = Date.now();
            const startTime = sale.pool.startTime*1000;
            const endTime = sale.pool.endTime*1000;
            if (sale.pool.state == 0) {
                if (now < startTime) {
                    return 0
                } else if (startTime < now && now < endTime) {
                    if (sale.pool.formattedHardCap == sale.pool.formattedTotalRaised) {
                        return 2
                    } else {
                        return 1
                    }
                } else if (now > endTime) {
                    return 2
                }
            } else if (sale.pool.state == 1) {
                return 4
            } else if (sale.pool.state == 2) {
                return 3
            }
        } catch (e) {
            console.log(e)
        }
    },
    formatSale: (a) => { // returns formatted version of sale
        try {
            let details = JSON.parse(a.pool.poolDetails)
            let kycDetails = a.pool.kycDetails == "" ? undefined : JSON.parse(a.pool.kycDetails)
    
            let sale = {
            uniqueKey: a.pool.address,
            presaleAddress: a.pool.address,
            tokenName: a.token.name,
            tokenSymbol: a.token.symbol,
            baseSymbol: a.currency.symbol,
            saleToken: a.token.address,
            audit: kycDetails?.b?.length > 0,
            auditLink: kycDetails?.b || undefined,
            kyc: !!a.pool.kycDetails,
            safu: a.pool.hasSafu,
            softCap: a.pool.formattedSoftCap,
            hardCap: a.pool.formattedHardCap,
            amountRaised: a.pool.formattedTotalRaised,
            telegramLink: details.f,
            twitterLink: details.d,
            websiteLink: details.b,
            submittedDescription: details.h,
            githubLink: details.e,
            redditLink: details.g,
            logoLink: details.a,
            startTime: a.pool.startTime * 1000,
            endTime: a.pool.endTime * 1000,
            createdAt: Date.parse(a.createdAt),
            poolType: a.pool.poolType,
            chain: a.chainId,
            chains: [pink.formatChain(a.chainId)],
            status: pink.getStatus(a),
            telegramMemberCount: a.pool.telegramMemberCount,
            telegramOnlineCount: a.pool.telegramOnlineCount,
            launchpad: 'pinksale',
            source: 'pinksale',
            launchpads: ['PinkSale']
            }
    
            return sale
        } catch (e) {
            console.log(e)
        }
    },
    getNonClosed: async () => { // returns formatted non-closed sales from pink api
        try {
            //let response = await fetch(process.env.PINK_API)
            //await response.json() // {data:[...], currentIndexes:[...], updatedAt: timeString}
            let answer = JSON.parse(fs.readFileSync(path.join(__dirname, '../dumps/DBDUMP_pinksale.json'), 'UTF-8'))
            let sales = []

            for (let i = 0; i < await answer.docs.length; i++) {
                if (true) {
                    let formattedSale = pink.formatSale(answer.docs[i])
                    sales.push(formattedSale)
                }
            }

            return sales.filter(item => item !== undefined)
        } catch (e) {
            console.log(e)
        }
    },
    getSingleSale: async (search) => { // returns single searched formatted sale from pink api
        try {
            let res = await fetch(`https://api.pinksale.finance/api/v1/pool/search?qs=${search}`);
            let ans = await res.json();
            return pink.formatSale(ans.docs[0]) || undefined
        } catch (e) {
            console.log(e)
        }
    },
    statusUpdate: async () => {
        try {
            let nonClosedFromDb= await db.getNonClosedBySource('pinksale')
            let nonClosedFromPinkApi = await pink.getNonClosed()
            let fromPinkObject = general.arrayToObject(nonClosedFromPinkApi, 'presaleAddress')
            for (let i = 0; i < nonClosedFromDb.length; i++) {
                if (fromPinkObject[nonClosedFromDb[i].presaleAddress] !== undefined) { // still in pink api (so either status 0 or 1)
                    if (nonClosedFromDb[i].status !== fromPinkObject[nonClosedFromDb[i].presaleAddress].status) { // if status different
                        console.log('in api and status different', nonClosedFromDb[i], fromPinkObject[nonClosedFromDb[i].presaleAddress])
                        await db.updateListing({'presaleAddress': nonClosedFromDb[i].presaleAddress}, {'status': fromPinkObject[nonClosedFromDb[i].presaleAddress].status})
                    }
                } else { // not in pink api anymore (so either status = 2,3,4)
                    let sale = await pink.getSingleSale(nonClosedFromDb[i].presaleAddress)
                    console.log('not in api and status different', nonClosedFromDb[i], sale)
                    await db.updateListing({'presaleAddress': nonClosedFromDb[i].presaleAddress}, {'status': sale.status})
                }
            }
        } catch (e) {
            console.log(e)
        }
    },
    checkNew: async () => {
        try {

            const alreadyIncluded = await db.getAllMinBySource('pinksale')
            const nonClosedFromPinkApi = await pink.getNonClosed()
            
            const toInclude = nonClosedFromPinkApi.filter(item => !alreadyIncluded.includes(item.presaleAddress) && item.audit && item.kyc)
            const toIncludeWithAnalyzedFalse = toInclude.map(item => ({...item, 'analyzed': false}))

            if (toIncludeWithAnalyzedFalse.length > 0) {
                await db.createListings(process.env.DB_COLL, toIncludeWithAnalyzedFalse)
            }
        } catch (e) {
            console.log(e)
        }
    },
}

module.exports = pink