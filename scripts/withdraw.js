const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)
  const transactionResponse = await fundMe.withdraw()
  const receipt = await transactionResponse.wait(1)
  console.log("Withdraw successfully!!")
}
