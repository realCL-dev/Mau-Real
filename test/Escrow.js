const { ethers } = require('hardhat')
const { expect } = require('chai')

const weiValue = n => {
  return ethers.utils.parseUnits(n.toString(), 'ethers')
}

describe('Escrow', function () {
  let buyer, seller, valuator, lender
  let realEstate, escrow

  beforeEach(async () => {
     [buyer, seller, valuator, lender] = await ethers.getSigners()

    // Deploy Real Estate
    const RealEstate = await ethers.getContractFactory('RealEstate')
    realEstate = await RealEstate.deploy() // returns a deployed contract in ethers v6.
    console.log(realEstate.target) // Use realEstate.target instead of realEstate.address

    // Mint the NFT
    let transaction = await realEstate
      .connect(seller)
      .mint(
        'https://eu.starton-ipfs.com/ipfs//bafybeicqtxaqxm6nnqokx4nekbxuhq5icmfwjut7xyrnpqrw6os5fe3rli'
      )
    await transaction.wait()

    const Escrow = await ethers.getContractFactory('Escrow')
    escrow = await Escrow.deploy(
      realEstate.target,
      seller.address,
      valuator.address,
      lender.address
    )
  })

  describe('Deployment', () => {
    it('returns all the addresses', async function () {
      let result = await escrow.nftAddress()
      expect(result).to.be.equal(realEstate.target)

      result = await escrow.seller()
      expect(result).to.be.equal(seller.address)

      result = await escrow.valuator()
      expect(result).to.be.equal(valuator.address)

      result = await escrow.lender()
      expect(result).to.be.equal(lender.address)
    })
  })
})
