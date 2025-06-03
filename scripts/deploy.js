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
    .list(1, buyer.address, weiValue(150), weiValue(15))
  await transaction.wait()

  /////////
  transaction = await realEstate
    .connect(seller)
    .mint(
      'https://eu.starton-ipfs.com/ipfs//bafkreie3bs74adylxtdtjtry4yiapapcdak2w4sps5kzcvhh5r23kbmijq'
    )
  await transaction.wait()

  transaction = await realEstate.connect(seller).approve(escrow.target, 2)
  await transaction.wait()

  transaction = await escrow
    .connect(seller)
    .list(2, buyer.address, weiValue(120), weiValue(12))
  await transaction.wait()

    transaction = await realEstate
    .connect(seller)
    .mint(
      'https://eu.starton-ipfs.com/ipfs//bafkreifoqyvcglhov6kjkf5og2db67ugwb4paukop2cksekavx6v5yfnka'
    )
  await transaction.wait()

  transaction = await realEstate.connect(seller).approve(escrow.target, 3)
  await transaction.wait()

  transaction = await escrow
    .connect(seller)
    .list(3, buyer.address, weiValue(160), weiValue(16))
  await transaction.wait()


  const supply = await realEstate.totalSupply()
  console.log('Total Supply after mint:', supply.toString())


  console.log('Finished.')
}

main().catch(console.error)
