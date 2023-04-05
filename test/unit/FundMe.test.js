const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const sendValue = ethers.utils.parseEther("1")

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("FundMe", async function () {
      let fundMe, mockV3Aggregator, deployer
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        console.log("deployer: ", deployer)
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async () => {
        it("aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe("fund", async () => {
        it("fails if not enough eth", async function () {
          await expect(fundMe.fund()).to.be.reverted
        })

        it("updates amount data funded", async function () {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmount(deployer)
          assert.equal(response.toString(), sendValue)
        })

        it("add getFunders", async function () {
          await fundMe.fund({ value: sendValue })
          const response = (await fundMe.getFunders())[0]
          assert.equal(response, deployer)
        })
      })

      describe("withdraw", async function () {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it("from single funcer", async () => {
          const startingContract = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployer = await fundMe.provider.getBalance(deployer)

          const transactionResponse = await fundMe.withdraw()
          const receipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = receipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingContract = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployer = await fundMe.provider.getBalance(deployer)

          assert.equal(endingContract, 0)
          assert.equal(
            endingDeployer.add(gasCost).toString(),
            startingContract.add(startingDeployer).toString()
          )
        })

        it("multiple getFunders", async () => {
          const accounts = await ethers.getSigners()
          const max_accs = 6
          for (let i = 1; i < max_accs; i++) {
            const fundMeConnected = await fundMe.connect(accounts[i])
            await fundMeConnected.fund({ value: sendValue })
          }
          const startingContract = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployer = await fundMe.provider.getBalance(deployer)

          const transactionResponse = await fundMe.withdraw()
          const receipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = receipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingContract = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployer = await fundMe.provider.getBalance(deployer)

          assert.equal(endingContract, 0)
          assert.equal(
            endingDeployer.add(gasCost).toString(),
            startingContract.add(startingDeployer).toString()
          )

          for (let i = 1; i < max_accs; i++) {
            const balance = await fundMe.getAddressToAmount(accounts[i].address)
            assert.equal(balance, 0)
          }
        })

        it("only owner", async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]

          const fundMeConnected = await fundMe.connect(attacker)

          await expect(
            fundMeConnected.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
      })

      describe("Cheaper withdraw", async function () {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it("from single funcer", async () => {
          const startingContract = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployer = await fundMe.provider.getBalance(deployer)

          const transactionResponse = await fundMe.cheaperWithdraw()
          const receipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = receipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingContract = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployer = await fundMe.provider.getBalance(deployer)

          assert.equal(endingContract, 0)
          assert.equal(
            endingDeployer.add(gasCost).toString(),
            startingContract.add(startingDeployer).toString()
          )
        })

        it("multiple getFunders", async () => {
          const accounts = await ethers.getSigners()
          const max_accs = 6
          for (let i = 1; i < max_accs; i++) {
            const fundMeConnected = await fundMe.connect(accounts[i])
            await fundMeConnected.fund({ value: sendValue })
          }
          const startingContract = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployer = await fundMe.provider.getBalance(deployer)

          const transactionResponse = await fundMe.cheaperWithdraw()
          const receipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = receipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingContract = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployer = await fundMe.provider.getBalance(deployer)

          assert.equal(endingContract, 0)
          assert.equal(
            endingDeployer.add(gasCost).toString(),
            startingContract.add(startingDeployer).toString()
          )

          for (let i = 1; i < max_accs; i++) {
            const balance = await fundMe.getAddressToAmount(accounts[i].address)
            assert.equal(balance, 0)
          }
        })

        it("only owner", async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]

          const fundMeConnected = await fundMe.connect(attacker)

          await expect(
            fundMeConnected.cheaperWithdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
      })
    })
