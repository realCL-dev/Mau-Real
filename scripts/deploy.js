const RealEstate = require('../ignition/modules/RealEstate')
const Escrow = require('../ignition/modules/Escrow')

const hre = require('hardhat')

const weiValue = n => {
  //In Hardhat with ethers v6, utility functions like parseUnits are now under ethers.parseUnits, not ethers.utils.parseUnits.
  return hre.ethers.parseUnits(n.toString(), 'ether')
}

async function main () {
  const [seller, valuator, lender, buyer] = await hre.ethers.getSigners()
  const { realEstate } = await hre.ignition.deploy(RealEstate)
  const { escrow } = await hre.ignition.deploy(Escrow)

  console.log(`realEstate deployed to: ${await realEstate.getAddress()}`)
  console.log(`escrow deployed to: ${await escrow.getAddress()}`)

  let transaction = await realEstate
    .connect(seller)
    .mint(
      'https://eu.starton-ipfs.com/ipfs//bafkreianozrqeunt4pbsckk45ggbrciwvcrfmkyw2gkvdsm2rpn5qdlwzu'
    )
  await transaction.wait()

  transaction = await realEstate.connect(seller).approve(escrow.target, 1)
  await transaction.wait()

  transaction = await escrow
    .connect(seller)
    .list(1, buyer.address, weiValue(50), weiValue(5))
  await transaction.wait()

  console.log('Finished.')
}

main().catch(console.error)
