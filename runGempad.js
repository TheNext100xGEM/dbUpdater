const gempad = require('./functions/gempad')

const run = async () => {
    try {
        await gempad.checkNew()
        await gempad.statusUpdate()
    } catch (e) {
        console.log(e)
    }
}

run()