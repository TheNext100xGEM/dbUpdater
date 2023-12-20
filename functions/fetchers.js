require('dotenv').config({ path: '.env.local'})
const { MongoClient } = require('mongodb')

// ran updates on cryptorank
// unified chains,launchpads data type for all sources
// fully updated/simplified gempad checkNew and statusUpdate processes

const helper = {
    general: {
        arrayToObject : (array, keyField) => {
            return array.reduce((obj, item) => {
                obj[item[keyField]] = item
                return obj
            }, {})
        },
        run : async () => {
            try {

            } catch (e) {
                console.log(e)
            }
        },
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
    },
    db: {
        createListings: async (collName, newListings) => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                await client.db(process.env.DB_NAME).collection(collName).insertMany(newListings)
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getRaw: async () => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const raw = await client.db(process.env.DB_NAME).collection(process.env.DB_COLL_RAW).find().toArray()
                return raw
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getNonClosed: async () => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const nonClosed = await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).find({'status': {$lt: 2}}).toArray()
                return nonClosed
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getNonClosedBySource: async (source) => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const nonClosed = await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).find({'source': source, 'status': {$lt: 2}}).toArray()
                return nonClosed
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getBySource: async (source) => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const nonClosed = await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).find({'source': source}).toArray()
                return nonClosed
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        updateListing: async (index, data) => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).updateOne(index, {$set: data})
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getAllMinBySource: async (source) => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const all = await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).find({'source': source}).project({'uniqueKey': 1, '_id': 0}).toArray()

                return all.map(item => item.uniqueKey)
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getCollections: async () => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const collections = await client.db(process.env.DB_NAME).listCollections().toArray()
                console.log(collections)
                return collections
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getNumDocuments: async (collName) => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const numDocuments = await client.db(process.env.DB_NAME).collection(collName).countDocuments()
                console.log(numDocuments)
                return numDocuments
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        createCollection: async (collName) => {
            try {
                const uri = process.env.DB_URI
                const client = new MongoClient(uri)
                try {
                    await client.connect()
                    await client.db(process.env.DB_NAME).createCollection(collName)
                } catch (e) {
                    console.log(e)
                } finally {
                    await client.close()
                }
            } catch (e) {
                console.log(e)
            }
        },
        getByUniqueKey: async (key) => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const all = await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).find({'uniqueKey': key}).toArray()

                return all
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getLowQuality: async () => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const nonClosed = await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).find({'kyc': false}).toArray()
                return nonClosed
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        removeListings: async () => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).deleteMany({'kyc': false})
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },
        getMissingAnalyzed: async () => {
            const uri = process.env.DB_URI
            const client = new MongoClient(uri)
            try {
                await client.connect()
                const missing = await client.db(process.env.DB_NAME).collection(process.env.DB_COLL).find({'analyzed': {$exists: false}}).toArray()
                return missing
            } catch (e) {
                console.log(e)
            } finally {
                await client.close()
            }
        },

    },
    pink: {
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
                uniqueKey: a.poolAddress,
                presaleAddress: a.poolAddress,
                tokenName: a.token.name,
                tokenSymbol: a.token.symbol,
                baseSymbol: a.currency.symbol,
                saleToken: a.token.address,
                audit: a.pool.hasAudit,
                auditLink: kycDetails?.b || undefined,
                kyc: a.pool.hasKyc,
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
                status: helper.pink.getStatus(a),
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
                let response = await fetch(process.env.PINK_API)
                let answer = await response.json() // {data:[...], currentIndexes:[...], updatedAt: timeString}
                let sales = []

                for (let i = 0; i < await answer.data.length; i++) {
                    if (helper.pink.chains.includes(answer.data[i].chainId) &&
                    !helper.pink.banned.includes(answer.data[i].poolAddress) &&
                    answer.data[i].pool.state < 1) {
                        let formattedSale = helper.pink.formatSale(answer.data[i])
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
                return helper.pink.formatSale(ans.docs[0]) || undefined
            } catch (e) {
                console.log(e)
            }
        },
        statusUpdate: async () => {
            try {
                let nonClosedFromDb= await helper.db.getNonClosedBySource('pinksale')
                let nonClosedFromPinkApi = await helper.pink.getNonClosed()
                let fromPinkObject = helper.general.arrayToObject(nonClosedFromPinkApi, 'presaleAddress')
                for (let i = 0; i < nonClosedFromDb.length; i++) {
                    if (fromPinkObject[nonClosedFromDb[i].presaleAddress] !== undefined) { // still in pink api (so either status 0 or 1)
                        if (nonClosedFromDb[i].status !== fromPinkObject[nonClosedFromDb[i].presaleAddress].status) { // if status different
                            console.log('in api and status different', nonClosedFromDb[i], fromPinkObject[nonClosedFromDb[i].presaleAddress])
                            // await helper.db.updateListing({'presaleAddress': nonClosedFromDb[i].presaleAddress}, {'status': fromPinkObject[nonClosedFromDb[i].presaleAddress].status})
                        }
                    } else { // not in pink api anymore (so either status = 2,3,4)
                        let sale = await helper.pink.getSingleSale(nonClosedFromDb[i].presaleAddress)
                        console.log('not in api and status different', nonClosedFromDb[i], sale)
                        // await helper.db.updateListing({'presaleAddress': nonClosedFromDb[i].presaleAddress}, {'status': sale.status})
                    }
                }
            } catch (e) {
                console.log(e)
            }
        },
        checkNew: async () => {
            try {
                const alreadyIncluded = await helper.db.getAllMinBySource('pinksale')
                const nonClosedFromPinkApi = await helper.pink.getNonClosed()
                
                const toInclude = nonClosedFromPinkApi.filter(item => !alreadyIncluded.includes(item.presaleAddress) && item.audit && item.kyc)
                const toIncludeWithAnalyzedFalse = toInclude.map(item => ({...item, 'analyzed': false}))
                console.log(toIncludeWithAnalyzedFalse)
                if (toIncludeWithAnalyzedFalse.length > 0) {
                    await helper.db.createListings(process.env.DB_COLL, toIncludeWithAnalyzedFalse)
                }
            } catch (e) {
                console.log(e)
            }
        },
    },
    gempad: {
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
                    let poolFromGem = await helper.gempad.getSingleSale(answer[i].presaleAddress, helper.gempad.convertChainToId(answer[i].chain), answer[i].poolType == "special" ? true : false)
                    const formatted = helper.gempad.formatSingleSale(poolFromGem, answer[i])
                    formattedSales.push(formatted)
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
                
                return formattedSales
            } catch (e) {
                console.log(e)
            }
        },
        getSingleSale: async (saleAddress, chainId, isSpecialSale) => {
            try {
                let response = await fetch(`https://gempad.app/api/${chainId}/${isSpecialSale ? "special-pool-api" : "pool-api"}/${saleAddress}`, helper.gempad.fetchOptions)
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
                    'chains': [helper.gempad.formatChainString(poolFromLw.chain)],
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
                let nonClosedFromDb = await helper.db.getNonClosedBySource('gempad')
                let nonClosedFromGemApi = await helper.gempad.getNonClosed()
                let fromGemObject = helper.general.arrayToObject(nonClosedFromGemApi, 'presaleAddress')

                for (let i = 0; i < nonClosedFromDb.length; i++) {
                    if (fromGemObject[nonClosedFromDb[i].presaleAddress] !== undefined) {
                        if (nonClosedFromDb[i].status !== fromGemObject[nonClosedFromDb[i].presaleAddress].status) { // if status different
                            console.log('in api and status different', nonClosedFromDb[i], fromGemObject[nonClosedFromDb[i].presaleAddress])
                            await helper.db.updateListing({'presaleAddress': nonClosedFromDb[i].presaleAddress}, {'status': fromGemObject[nonClosedFromDb[i].presaleAddress].status})
                        }
                    } else { // not in gem api anymore (so either status = 2,3,4)
                        let poolFromLw = await helper.gempad.getPoolFromLw(nonClosedFromDb[i].presaleAddress)
                        console.log('not in api and status different', nonClosedFromDb[i], poolFromLw)                                                
                        await helper.db.updateListing({'presaleAddress': nonClosedFromDb[i].presaleAddress}, {'status': poolFromLw.status})
                    }
                }
            } catch (e) {
                console.log(e)
            }
        },
        checkNew: async () => {
            try {
                const alreadyIncluded = await helper.db.getAllMinBySource('gempad')
                const nonClosedFromGemApi = await helper.gempad.getNonClosed()
                
                const toInclude = nonClosedFromGemApi.filter(item => !alreadyIncluded.includes(item.presaleAddress) && item.audit && item.kyc)
                const toIncludeWithAnalyzedFalse = toInclude.map(item => ({...item, 'analyzed': false}))
                console.log(toIncludeWithAnalyzedFalse)
                if (toIncludeWithAnalyzedFalse.length > 0) {
                    // await helper.db.createListings(process.env.DB_COLL, toIncludeWithAnalyzedFalse)
                }
            } catch (e) {
                console.log(e)
            }
        },
    },
    polkastarter: {
        getUpcoming: async () => {
            try {
                let response = await fetch('https://polkastarter.com/v3/projects?status=upcoming&view=metrics')
                let answer = await response.json()
                let formatted = []
                
                for (let i = 0; i < answer.data.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    let response2 = await fetch(`https://polkastarter.com/v3/projects/${answer.data[i].slug}`)
                    let answer2 = await response2.json()
                    formatted.push({
                        tokenName: answer2.data.name,
                        tokenSymbol: answer2.data.symbol,
                        websiteLink: answer2.data.website_url,
                        twitterLink: answer2.data.twitter_handle !== "" ? `https://twitter.com/${answer2.data.twitter_handle}` : '',
                        whitepaperLink: answer2.data.whitepaper_url,
                        telegramLink: answer2.data.telegram_handle !== "" ? `https://t.me/${answer2.data.telegram_handle}` : '',
                        submittedDescription: answer2.data.description
                    })
                }

                return formatted
            } catch (e) {
                console.log(e)
            }
        }
    },
    seedify: {
        getUpcoming: async () => {
            try {
                let response = await fetch('https://api-igo.seedify.fund/api/pools/get_upcPool')
                let answer = await response.json()
                let formatted = []
                
                for (let i = 0; i < answer['upcPool'].length; i++) {
                    if (answer['upcPool'][i].symbol !== "TEST") {
                        formatted.push({
                            tokenName: answer['upcPool'][i].title,
                            tokenSymbol: answer['upcPool'][i].symbol,
                            websiteLink: answer['upcPool'][i].browser_web_link,
                            twitterLink: answer['upcPool'][i].twitter_link,
                            whitepaperLink: answer['upcPool'][i].white_paper,
                            telegramLink: answer['upcPool'][i].telegram_link,
                            submittedDescription: answer['upcPool'][i].description
                        })
                    }
                }

                return formatted

            } catch (e) {
                console.log(e)
            }
        }
    },
    daomaker: {
        getUpcoming: async () => {
            try {
                let response = await fetch('https://api.daomaker.com/prepareHomePage')
                let answer = await response.json()
                let formatted = []
                
                for (let i = 0; i < answer.offerings.length; i++) {
                    formatted.push({
                        tokenName: answer.offerings[i].title,
                        tokenSymbol: answer.offerings[i].token_ticker,
                        websiteLink: answer.offerings[i].company[0].website_url,
                        twitterLink: answer.offerings[i].company[0].twitter_url,
                        telegramLink: answer.offerings[i].company[0].telegram_url,
                        submittedDescription: answer.offerings[i].company[0].short_description,
                        status: answer.offerings[i].ended ? 2 : 0
                    })
                }

                console.log(formatted)
                                
            } catch (e) {
                console.log(e)
            }
        }
    },
    cryptorank: {
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
                    const single = await helper.cryptorank.getSingle(answer.data[i].key)
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
                    status: helper.cryptorank.formatStatus(single.icoStatus),
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
                let nonClosedFromDb= await helper.db.getNonClosedBySource('cryptorank')
                let nonClosedFromCRApi = await helper.cryptorank.getUpcoming()
                let fromCRObject = helper.general.arrayToObject(nonClosedFromCRApi, 'uniqueKey')

                for (let i = 0; i < nonClosedFromDb.length; i++) {
                    if (fromCRObject[nonClosedFromDb[i].uniqueKey] !== undefined) { // still in cryptorank api (so either status = 0,1)
                        if (nonClosedFromDb[i].status !== fromCRObject[nonClosedFromDb[i].uniqueKey].status) { // if status different
                            console.log('in api and status different', nonClosedFromDb[i], fromCRObject[nonClosedFromDb[i].uniqueKey])
                            await helper.db.updateListing({'uniqueKey': nonClosedFromDb[i].uniqueKey}, {'status': fromCRObject[nonClosedFromDb[i].uniqueKey].status})
                        }
                    } else { // not in api anymore (so either status = 2,3,4)
                        let sale = await helper.cryptorank.getSingle(helper.cryptorank.getKeyFromUnique(nonClosedFromDb[i].uniqueKey))
                        console.log('not in api and status different', nonClosedFromDb[i], sale.formatted)                                                
                        await helper.db.updateListing({'uniqueKey': nonClosedFromDb[i].uniqueKey}, {'status': sale.formatted.status})
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                }
            } catch (e) {
                console.log(e)
            }
        },
        checkNew: async () => {
            try {
                const alreadyIncluded = await helper.db.getAllMinBySource('cryptorank')
                const nonClosedFromCRApi = await helper.cryptorank.getUpcoming()
                
                const toInclude = nonClosedFromCRApi.filter(item => !alreadyIncluded.includes(item.uniqueKey))
                console.log(toInclude)
                if (toInclude.length > 0) {
                    await helper.db.createListings(process.env.DB_COLL, toInclude)
                }
            } catch (e) {
                console.log(e)
            }
        },
    }
}