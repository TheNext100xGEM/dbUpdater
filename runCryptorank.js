const cryptorank = require('./functions/cryptorank')

const run = async () => {
    try {
        await cryptorank.checkNew()
        await cryptorank.statusUpdate()
    } catch (e) {
        console.log(e)
    }
}

run()