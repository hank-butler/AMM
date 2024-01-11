const { ethers } = require("hardhat");
const hre = require("hardhat");
const config = require("../src/config.json")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

async function main() {

    console.log('Fetching accounts and network \n')

    // Fetch accounts
    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const investor4 = accounts[4]

    // Fetch network
    const { chainId } = await ethers.provider.getNetwork()

    console.log('Transferring tokens to account \n')

    // Fetch Dapp Token
    const dapp = await ethers.getContractAt('Token', config[chainId].dapp.address)
    console.log(`Dapp fetched: ${dapp.address}\n`)

    // Fetch USD Token
    const usd = await ethers.getContractAt('Token', config[chainId].usd.address)
    console.log(`USD fetched: ${usd.address}\n`)

    // check with npx hardhat run scripts/seed.js --network localhost (make sure you have local node running in terminal)

    // Distribute tokens to investors
    let transaction

    // Send dapp tokens to investor1
    transaction = await dapp.connect(deployer).transfer(investor1.address, tokens(10))
    await transaction.wait()

    // Send usd tokens to investor2
    transaction = await usd.connect(deployer).transfer(investor2.address, tokens(10))
    await transaction.wait()

    // Send dapp tokens to investor3
    transaction = await dapp.connect(deployer).transfer(investor3.address, tokens(10))
    await transaction.wait()

    // Send dapp tokens to investor4
    transaction = await usd.connect(deployer).transfer(investor4.address, tokens(10))
    await transaction.wait()

    // Adding liquidity
    
    let amount = tokens(100)

    console.log(`Fetching AMM contract \n`)

    // fetch AMM
    // Got an error while trying to run this, video at 10min 30 sec
    const amm = await ethers.getContractAt('AMM', config[chainId].amm.address)
    console.log(`AMM fetched: ${amm.address}\n`)

    transaction = await dapp.connect(deployer).approve(amm.address, amount)
    await transaction.wait()

    transaction = await usd.connect(deployer).approve(amm.address, amount)
    await transaction.wait()

    // Deployer adds liquidity
    console.log('Adding liquidity \n')
    transaction = await amm.connect(deployer).addLiquidity(amount, amount)
    await transaction.wait()

    // ///////////////////////////////
    // Investor 1 Swap: Dapp -> USD
    console.log(`Investor 1 swaps\n`)
    // Investor 1 approves all tokens
    transaction = await dapp.connect(investor1).approve(amm.address, tokens(10))
    await transaction.wait()

    // Investor1 swaps tokens
    transaction = await amm.connect(investor1).swapToken1(tokens(1))
    await transaction.wait()

    // ///////////////////////////////
    // Investor2 Swaps USD for Dapp
    console.log(`Investor 2 swaps\n`)

    transaction = await usd.connect(investor2).approve(amm.address, tokens(10))
    await transaction.wait()

    // Investor2 swaps tokens
    transaction = await amm.connect(investor2).swapToken2(tokens(1))
    await transaction.wait()

    // ///////////////////////////////
    // Investor3 Swaps: Dapp --> USD
    console.log(`Investor 3 swaps \n`)

    // Investor approves all tokens
    transaction = await dapp.connect(investor3).approve(amm.address, tokens(10))
    await transaction.wait()

    // Investor swaps
    transaction = await amm.connect(investor3).swapToken1(tokens(10))
    await transaction.wait()

    // ///////////////////////////////
    // Investor 4 swaps USD for Dapp
    console.log(`Investor 4 swaps\n`)

    transaction = await usd.connect(investor4).approve(amm.address, tokens(10))
    await transaction.wait()

    // Investor2 swaps tokens
    transaction = await amm.connect(investor4).swapToken2(tokens(5))
    await transaction.wait()

    console.log(`finished! \n`)


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})