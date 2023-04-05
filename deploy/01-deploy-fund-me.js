// async function deployFunc(hre) {}
// module.exports.default = deployFunc

const { network } = require("hardhat")
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config.js")
const { verify } = require("../utils/verify.js")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  // const ethUsdPriceFeedAddress = networkConfig[chainId]["priceFeedAddress"]
  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    const ethUSDAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUSDAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"]
  }

  const args = [ethUsdPriceFeedAddress]

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, //price feed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args)
  }

  log("Done bitch")
}

module.exports.tags = ["all", "fundMe"]
