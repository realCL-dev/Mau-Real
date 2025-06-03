//const addresses = require('../deployments/chain-11155111/deployed_addresses.json')
const addresses = require('../deployments/chain-31337/deployed_addresses.json')
const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

const realEstateAddress = addresses['RealEstateModule#RealEstate']

module.exports = buildModule('EscrowModule', m => {
  const seller = m.getAccount(0)
  const valuator = m.getAccount(1)
  const lender = m.getAccount(2)

  const escrow = m.contract('Escrow', [
    realEstateAddress, seller, valuator, lender
  ])
  return { escrow }
})
