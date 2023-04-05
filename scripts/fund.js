const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
  const sendValue = ethers.utils.parseEther("1")
  const { deployer } = (await getNamedAccounts()).deployer
  const fundMe = await ethers.getContract("FundMe", deployer)

  const transactionResponse = await fundMe.fund({ value: sendValue })
  const receipt = await transactionResponse.wait(1)

  console.log("Funded")
}

await main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
