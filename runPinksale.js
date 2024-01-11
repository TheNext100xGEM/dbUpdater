const pink = require('./functions/pink')

const run = async () => {
    try {
        await pink.checkNew()
        await pink.statusUpdate()
    } catch (e) {
        console.log(e)
    }
}

run()