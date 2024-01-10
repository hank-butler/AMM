// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Deploy Token
  const Token = await hre.ethers.getContractFactory('Token')

  // Deploy Dapp Token (token 1)
  let dapp = await Token.deploy('Dapp Token', 'DAPP', '1000000') // 1mm tokens
  await dapp.deployed()
  console.log(`Dapp Token deployed to: ${dapp.address}\n`)

  // Deploy Token 2
  const usd = await Token.deploy('USD Token', 'USD', '1000000') // 1mm tokens
  await usd.deployed()
  console.log(`USD Token deployed to: ${usd.address}\n`)

  // Deploy AMM
  const AMM = await hre.ethers.getContractFactory('AMM')
  const amm = await AMM.deploy(dapp.address, usd.address)

  console.log(`AMM contract deployed to: ${amm.address}\n`)

}
// Open a new tab in terminal, run a new local blockchain
// ~6' into video
// RUN IN TERMINAL: npx hardhat node
// Go to other tab in terminal and run
// npx hardhat run scripts/deploy.js --network localhost
// should see address for contracts deployed
// Save them to config file.



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
