//xd


const {downloadJson} = require('../lib/utils/download');
const fs = require('fs');
const path = require('path');

const dbdump = {
    pinksale: async ()  => {
        
        //get total count
        const countData = await fetch('https://api.pinksale.finance/api/v1/pool/list?limit=1&page=1');
        const data = await countData.json();

        const totalDocuments = data.totalPages;
        await downloadJson(`https://api.pinksale.finance/api/v1/pool/list?limit=${totalDocuments}&page=1`, path.join(__dirname, '../dumps/DBDUMP_pinksale.json'))
        return totalDocuments;

    },
    cryptorank: async () => {
        await downloadJson('https://api.cryptorank.io/v0/coins', path.join(__dirname, '../dumps/DBDUMP_cryptorank.json'))
        const count = JSON.parse(fs.readFileSync(path.join(__dirname, '../dumps/DBDUMP_cryptorank.json'), 'UTF-8')).data.length
        return count;
    },

    polkastarter: async () => {
        const countData = await fetch('https://polkastarter.com/v3/projects?search=&page=1');
        const data = await countData.json();

        const totalDocuments = data.metadata.total_entries;
        await downloadJson(`https://polkastarter.com/v3/projects?search=&page=1&per_page=${totalDocuments}`, path.join(__dirname, '../dumps/DBDUMP_polkastarter.json'))
        return totalDocuments;
    },
    

}

async function dbdumpall(){
    let dbs = await Promise.all(Object.values(dbdump).map(dump => dump()))
    console.log(dbs)
}

module.exports = {
    dbdumpall
}