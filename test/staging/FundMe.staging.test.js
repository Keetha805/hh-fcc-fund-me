const { ethers, network, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)
  ? describe.skip()
  : describe("FundMe", async () => {
      let fundMe, deployer
      const sendValue = ethers.utils.parseEther("1")

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      describe("fund", async () => {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const ending = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(ending, 0)
      })
    })
