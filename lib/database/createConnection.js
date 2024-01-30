const mongoose = require('mongoose');
const env = require('dotenv').config()

function isValidId(str) {
    return /^[a-fA-F0-9]{24}$/.test(str);
}

let databaseConnection = function(){
    return new Promise(async function(resolve, reject){

        let models = {}

        await mongoose.connect(process.env.MONGO_URI)

        models.Project = require('./models/Project.js').Project

        models.utils = {
            isValidId
        }


        models.mongoose = mongoose


        resolve(models)
    })
}


module.exports = {
    databaseConnection
}