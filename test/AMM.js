const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens;

describe('AMM', () => {
    // accounts up here
    let accounts, 
        deployer,
        liquidityProvider 
    // contracts 
    let token1, 
        token2, 
        amm

    beforeEach(async () => {
        // Setup Accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        liquidityProvider = accounts[1]

        // Deploy Token
        const Token = await ethers.getContractFactory('Token')
        token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')
        token2 = await Token.deploy('USD Token', 'USD', '1000000')

        // Send tokens to litquidity provider
        let transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
        await transaction.wait()
        
        transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
        await transaction.wait()

        // Deploy AMM
        const AMM = await ethers.getContractFactory('AMM')
        amm = await AMM.deploy(token1.address, token2.address)

    })

    describe('Deployment', () => {
        it('has an address', async () => {
            expect(amm.address).to.not.equal(0x0)
        })

        it('returns token 1', async () => {
            expect(await amm.token1()).to.equal(token1.address)
        })

        it('returns token 2', async () => {
            expect(await amm.token2()).to.equal(token2.address)
        })
    })

    describe('Swapping Tokens', () => {

        let amount, transaction, result 

        it('facilitates swaps', async () => {
            amount = tokens(100000)
            transaction = await token1.connect(deployer).approve(amm.address, amount)
            await transaction.wait()

            transaction = await token2.connect(deployer).apporve(amm.address, amount)
            await transaction.wait()

            // Deployer add liquidity
            transaction = await amm.connect(deployer).addLiquidity(amount, amount)
            await transaction.wait()

            // Check AMM receives tokens
            expect(await token1.balanceOf(amm.address)).to.equal(amount)
            expect(await token2.balanceOf(amm.address)).to.equal(amount)

            
        })
    })
})