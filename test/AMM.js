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
        liquidityProvider,
        investor1,
        investor2
    // contracts 
    let token1, 
        token2, 
        amm

    beforeEach(async () => {
        // Setup Accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        liquidityProvider = accounts[1]
        investor1 = accounts[2]
        investor2 = accounts[3]

        // Deploy Token
        const Token = await ethers.getContractFactory('Token')
        token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')
        token2 = await Token.deploy('USD Token', 'USD', '1000000')

        // Send tokens to litquidity provider
        let transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
        await transaction.wait()
        
        transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
        await transaction.wait()

        // Send token1 to investor1
        transaction = await token1.connect(deployer).transfer(investor1.address, tokens(100000))
        await transaction.wait()

        // Send token2 to investor2
        transaction = await token2.connect(deployer).transfer(investor2.address, tokens(100000))
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

        let amount, transaction, result, estimate, balance 

        it('facilitates swaps', async () => {
            amount = tokens(100000)
            transaction = await token1.connect(deployer).approve(amm.address, amount)
            await transaction.wait()

            transaction = await token2.connect(deployer).approve(amm.address, amount)
            await transaction.wait()

            // Deployer add liquidity
            transaction = await amm.connect(deployer).addLiquidity(amount, amount)
            await transaction.wait()

            // Check AMM receives tokens
            expect(await token1.balanceOf(amm.address)).to.equal(amount)
            expect(await token2.balanceOf(amm.address)).to.equal(amount)

            expect(await amm.token1Balance()).to.equal(amount)
            expect(await amm.token2Balance()).to.equal(amount)

            // Check deployer share amount
            expect(await amm.shares(deployer.address)).to.equal(tokens(100))

            // Check pool has 100 total shares
            expect(await amm.totalShares()).to.equal(tokens(100))

            // LP adds more liquidity

            // LP 50K tokens
            amount = tokens(50000)
            transaction = await token1.connect(liquidityProvider).approve(amm.address, amount)
            await transaction.wait()

            transaction = await token2.connect(liquidityProvider).approve(amm.address, amount)
            await transaction.wait()

            // Calculate token2 deposit amount
            let token2Deposit = await amm.calculateToken2Deposit(amount)

            // LP adds liquidity
            transaction = await amm.connect(liquidityProvider).addLiquidity(amount, token2Deposit)
            await transaction.wait()

            // check LP has correct share amount
            expect(await amm.shares(liquidityProvider.address)).to.equal(tokens(50))
            // Deployer should still have 100 shares
            expect(await amm.shares(deployer.address)).to.equal(tokens(100))
            // Pool should have 150 shares
            expect(await amm.totalShares()).to.equal(tokens(150))

            // ============================== //
            // Investor 1 Swaps
            // ============================== //

            // Check price before swapping
            console.log(`Price before swap: ${await amm.token2Balance() / await amm.token1Balance()}\n`)
            

            // Investor1 approves all tokens
            transaction = await token1.connect(investor1).approve(amm.address, tokens(100000))
            await transaction.wait()

            // Check balance before swap
            balance = await token2.balanceOf(investor1.address)
            console.log(`Investor1 token2 balance before swap: ${ethers.utils.formatEther(balance)}\n`)
            // Estimate amount of tokens investor1 receives after swapping token1: include slippage
            estimate = await amm.calculateToken1Swap(tokens(1))
            console.log(`Token2 amount investor 1 will receive after swap: ${ethers.utils.formatEther(estimate)}\n`)

            // Investor1 swaps tokens
            transaction = await amm.connect(investor1).swapToken1(tokens(1))
            result = await transaction.wait()

            // Check swap event
            await expect(transaction).to.emit(amm, 'Swap')
                .withArgs(
                    investor1.address,
                    token1.address,
                    tokens(1),
                    token2.address,
                    estimate,
                    await amm.token1Balance(),
                    await amm.token2Balance(),
                    (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
                )

            // Check Investor1 Balance After swap
            balance = await token2.balanceOf(investor1.address)
            console.log(`Investor1 token2 balance after swap: ${ethers.utils.formatEther(balance)}\n`)

            expect(estimate).to.equal(balance)

            // AMM token balances in sync
            expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
            expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

            // Check price after swap
            console.log(`Price after swap: ${await amm.token2Balance() / await amm.token1Balance()}\n`)

            
            // Investor1 swaps again
            
            // Swap more tokens
            balance = await token2.balanceOf(investor1.address)
            console.log(`Investor 1 balance before second swap: ${ethers.utils.formatEther(balance)}\n`)

            estimate = await amm.calculateToken1Swap(tokens(1))
            console.log(`Token 2 amount investor1 will receive after swap: ${ethers.utils.formatEther(estimate)}\n`)

            transaction = await amm.connect(investor1).swapToken1(tokens(1))
            await transaction.wait()

            // Check Investor1 balance after swap
            balance = await token2.balanceOf(investor1.address)
            console.log(`Investor 1 token2 balance after swap: ${ethers.utils.formatEther(balance)}\n`)

            expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
            expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

            console.log(`Price after swap: ${await amm.token2Balance() / await amm.token1Balance()}\n`)

            // Investor 1 swaps large amount
            console.log('Checking large investor swap amount\n')

            // Swap more tokens
            balance = await token2.balanceOf(investor1.address)
            console.log(`Investor 1 balance before second swap: ${ethers.utils.formatEther(balance)}\n`)

            estimate = await amm.calculateToken1Swap(tokens(100))
            console.log(`Token 2 amount investor1 will receive after swap: ${ethers.utils.formatEther(estimate)}\n`)

            transaction = await amm.connect(investor1).swapToken1(tokens(100))
            await transaction.wait()

            // Check Investor1 balance after swap
            balance = await token2.balanceOf(investor1.address)
            console.log(`Investor 1 token2 balance after swap: ${ethers.utils.formatEther(balance)}\n`)

            expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
            expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

            console.log(`Price after swap: ${await amm.token2Balance() / await amm.token1Balance()}\n`)

        })
    })
})