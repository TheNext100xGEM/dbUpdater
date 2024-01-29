const proxyscraper = require('./functions/proxyscraper.js');

const MINUTES = 10;

async function start() {


    await proxyscraper.updateProxies()
    setInterval(async function(){

        await proxyscraper.updateProxies()
    }, MINUTES * 1000 * 60)
}

start()