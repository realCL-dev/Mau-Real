const { ethers } = require('hardhat')
const { expect } = require('chai')

const weiValue = n => {
  //In Hardhat with ethers v6, utility functions like parseUnits are now under ethers.parseUnits, not ethers.utils.parseUnits.
  return ethers.parseUnits(n.toString(), 'ether')
}

describe('Escrow', function () {
  let buyer, seller, valuator, lender
  let realEstate, escrow

  beforeEach(async () => {
    ;[buyer, seller, valuator, lender] = await ethers.getSigners()

    // Deploy Real Estate
    const RealEstate = await ethers.getContractFactory('RealEstate')
    realEstate = await RealEstate.deploy() // returns a deployed contract in ethers v6.
    //console.log('Deployed RealEstate at:', realEstate.target) // Use realEstate.target instead of realEstate.address

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
    //console.log('Deployed Escrow at:', escrow.target)

    //Approve property
    transaction = await realEstate.connect(seller).approve(escrow.target, 1)
    await transaction.wait()
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

  describe('Listings', () => {
    // List the NFT
    beforeEach(async () => {
      // List the NFT
      let transaction = await escrow
        .connect(seller)
        .list(1, buyer.address, weiValue(10), weiValue(5))
      await transaction.wait()
    })

    it('updates as Listed', async function () {
      const result = await escrow.isListed(1)
      expect(result).to.be.equal(true)
    })

    it('updates the ownership', async function () {
      // Check ownership
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.target)
    })

    it('returns the buyer', async () => {
      let result = await escrow.buyer(1)
      expect(result).to.be.equal(buyer.address)
    })

    it('returns the correct purchase price', async () => {
      const result = await escrow.purchasePrice(1)
      expect(result).to.be.equal(weiValue(10))
    })

    it('returns the deposit Amount', async () => {
      const result = await escrow.depositAmount(1)
      expect(result).to.be.equal(weiValue(5))
    })
  })

  describe('Deposits', () => {
    //List the NFT
    beforeEach(async () => {
      let transaction = await escrow
        .connect(seller)
        .list(1, buyer.address, weiValue(10), weiValue(5))
      await transaction.wait()
    })

    it('updates contract balance', async () => {
      const transaction = await escrow
        .connect(buyer)
        .payDeposit(1, { value: weiValue(5) })
      await transaction.wait()
      const result = await escrow.getBalance()
      expect(result).to.be.equal(weiValue(5))
    })
  })

  describe('Valuation', () => {
    // List the NFT
    beforeEach(async () => {
      let transaction = await escrow
        .connect(seller)
        .list(1, buyer.address, weiValue(10), weiValue(5))
      await transaction.wait()
    })

    it('checks valuation status', async () => {
      const transaction = await escrow
        .connect(valuator)
        .updateValuationStatus(1, true)
      await transaction.wait()
      const result = await escrow.valuationPassed(1)
      expect(result).to.be.equal(true)
    })
  })

  describe('Approval', () => {
    // List the NFT
    beforeEach(async () => {
      let transaction = await escrow
        .connect(seller)
        .list(1, buyer.address, weiValue(10), weiValue(5))
      await transaction.wait()
    })

    it('updates the approval status', async () => {
      let transaction = await escrow.connect(buyer).approveSale(1)
      await transaction.wait()
      transaction = await escrow.connect(seller).approveSale(1)
      await transaction.wait()
      transaction = await escrow.connect(lender).approveSale(1)
      await transaction.wait()

      expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
      expect(await escrow.approval(1, seller.address)).to.be.equal(true)
      expect(await escrow.approval(1, lender.address)).to.be.equal(true)
    })
  })

  describe('Sale of Property', () => {
    // List the NFT
    beforeEach(async () => {
      let transaction = await escrow
        .connect(seller)
        .list(1, buyer.address, weiValue(50), weiValue(5))
      await transaction.wait()

      transaction = await escrow
        .connect(buyer)
        .payDeposit(1, { value: weiValue(5) })
      //await transaction.wait()

      transaction = await escrow
        .connect(valuator)
        .updateValuationStatus(1, true)
      await transaction.wait()

      transaction = await escrow.connect(buyer).approveSale(1)
      await transaction.wait()

      transaction = await escrow.connect(seller).approveSale(1)
      await transaction.wait()

      transaction = await escrow.connect(lender).approveSale(1)
      await transaction.wait()

      transaction = await lender.sendTransaction({
        to: escrow.target,
        value: weiValue(45)
      })
      await transaction.wait()

      transaction = await escrow.connect(seller).finalizeSale(1)
      await transaction.wait()
    })

    it('updates the ownership of the property', async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
    })

    it('udpates the balances', async () => {
      expect(await escrow.getBalance()).to.be.equal(0)
    })
  })

  describe('Sale Cancellation', () => {
    // List the NFT
    beforeEach(async () => {
      let transaction = await escrow
        .connect(seller)
        .list(1, buyer.address, weiValue(50), weiValue(5))
      await transaction.wait()

      transaction = await escrow
        .connect(buyer)
        .payDeposit(1, { value: weiValue(5) })
      //await transaction.wait()

      transaction = await escrow
        .connect(valuator)
        .updateValuationStatus(1, true)
      await transaction.wait()

      transaction = await escrow.connect(buyer).approveSale(1)
      await transaction.wait()

      transaction = await escrow.connect(seller).approveSale(1)
      await transaction.wait()

      transaction = await escrow.connect(lender).approveSale(1)
      await transaction.wait()
    })

    it('properly handles cancellation before lender sends in funds ', async () => {
      let transaction = await escrow.cancelSale(1)
      await transaction.wait()
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.target)
      expect(await escrow.getBalance()).to.be.equal(0)
    })

    it('properly handles cancellation after lender sends in funds', async () => {
      let transaction = await lender.sendTransaction({
        to: escrow.target,
        value: weiValue(45)
      })
      await transaction.wait()
      transaction = await escrow.cancelSale(1)
      await transaction.wait()
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.target)
      expect(await escrow.getBalance()).to.be.equal(0)
    })
  })

  describe('Security Measures', () => {
    it('prevents a user other than the seller to list a property', async () => {
      await expect(
        escrow
          .connect(valuator)
          .list(1, buyer.address, weiValue(10), weiValue(5))
      ).to.be.reverted
    })
  })
})
