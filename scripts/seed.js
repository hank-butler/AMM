const { ethers } = require("hardhat");
const her = require("hardhat");
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


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})