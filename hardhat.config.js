require('@nomicfoundation/hardhat-toolbox')
require("dotenv").config();

const privateKeys = process.env.PRIVATE_KEYS || ""

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  networks: {
    localhost: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      //url:"http://192.168.100.42:8545",
      chainId: 11155111,
      accounts: privateKeys.split(',')
    }
  }
}
