const coinmarketcap = require('./functions/coinmarketcap');

const HOURS_INTERVAL = 24;

const run = async () => {

    setInterval(() => coinmarketcap.getNewTrending, 1000 * 60 * 60 * HOURS_INTERVAL)
    coinmarketcap.getNewTop()
}

run()