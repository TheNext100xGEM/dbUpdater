const { getDeployerFromAddress } = require('../lib/apis/evm')

async function start(){

    const deployer = await getDeployerFromAddress('0xfF51F8c96b2dA5eb0dAa1b008951F4b37295d3e7', 'Ethereum')

    console.log(deployer)
}

start()