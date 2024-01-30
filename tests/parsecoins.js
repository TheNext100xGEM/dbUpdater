const fs = require('fs')
const path = require('path')


let data = JSON.parse(fs.readFileSync(path.join(__dirname, '../dumps/allCoins.json'), 'UTF-8'))

fs.writeFileSync(path.join(__dirname, '../dumps/allCoins.json'), JSON.stringify(data, null, 2))