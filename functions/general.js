const general = {
    arrayToObject : (array, keyField) => {
        return array.reduce((obj, item) => {
            obj[item[keyField]] = item
            return obj
        }, {})
    },
    formatNumber: (number, decimals) => {
        return parseFloat((number / Math.pow(10, decimals)).toFixed(decimals))
    }
}

module.exports = general