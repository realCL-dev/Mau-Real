import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import Navigation from './components/Navigation'
import RealEstate from './abis/RealEstate.json'
import escrow from './abis/Escrow.json'
import config from './config.json'

function App () {
  const [account, setAccount] = useState(null)

  const loadBlockchainData = async () => {
    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      const account = ethers.getAddress(accounts[0])
      setAccount(account)
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <div>
        <h3>Welcome to Mau-Real</h3>
      </div>
    </div>
  )
}

export default App
