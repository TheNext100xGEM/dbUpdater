const { rpcProviders } = require('../configs/configs')  
const { Web3 }  = require('web3')

const addressBinarySearch = async (low, high, address, rpc_provider) => {
    if (low > high) return -1
    if(low == high) return low

    const middle = Math.floor((low + high) / 2)
    const BLOCK_NUMBER = middle
    const CODE = await rpc_provider.eth.getCode(address, BLOCK_NUMBER)
    if ( CODE != "0x") return await addressBinarySearch(low, middle, address, rpc_provider)
    
    return await addressBinarySearch(middle + 1, high, address, rpc_provider)
}

const findDeployerInBlock = async (block, contractAddress, rpc_provider) => {
    const Block = await rpc_provider.eth.getBlock(block, true)

    const HydratedTransactions = await Promise.all(
        Block.transactions.map(
            (Transaction) =>  rpc_provider.eth.getTransactionReceipt(Transaction.hash)
        )
    )

    return HydratedTransactions.find(Transaction => Transaction.contractAddress?.toLowerCase() === contractAddress.toLowerCase()).from
}

const getDeployerFromAddress = async (address, chain) => {
    const rpc_provider = new Web3(rpcProviders[chain])
    
    const latest = await rpc_provider.eth.getBlockNumber()
    const deploymentBlockNumber = await addressBinarySearch(0, Number(latest), address, rpc_provider)
    console.log(deploymentBlockNumber)

    return await findDeployerInBlock(deploymentBlockNumber, address, rpc_provider)
}


module.exports = {
    getDeployerFromAddress
}