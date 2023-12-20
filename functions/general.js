const general = {
    arrayToObject : (array, keyField) => {
        return array.reduce((obj, item) => {
            obj[item[keyField]] = item
            return obj
        }, {})
    },
}

module.exports = general