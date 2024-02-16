const dextools = require('./functions/dextools');
const {databaseConnection} = require('./lib/database/createConnection')

const HOURS_INTERVAL = 1;

const updateTrending = async (db) => {

    const {
        Project,
        mongoose
    } = db;

    try {
        
        let persistedTrending = await dextools.getNewTrending()

        await Project.updateMany({"isTrending": true}, {$set :{"isTrending": false}});

        persistedTrending = persistedTrending.map(item => item.uniqueKey )

        await Project.updateMany({uniqueKey: {$in: persistedTrending}}, {$set :{"isTrending": true}});
    } catch (e) {
        console.log(e)
    }
    return true;

}

const run = async () => {
    const db = await databaseConnection()

   setInterval(() => updateTrending(db), 1000 * 60 * 60 * HOURS_INTERVAL)
   updateTrending(db)
}

run()