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

    

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})