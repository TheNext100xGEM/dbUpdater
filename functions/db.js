require('dotenv').config({ path: '.env.local'})
const { MongoClient } = require('mongodb')

const db = {
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
}

module.exports = db