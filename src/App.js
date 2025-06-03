import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import Navigation from './components/Navigation'
import Search from './components/Search'
import Home from './components/Home'
import realEstateABI from './abis/RealEstate.json'
import escrowABI from './abis/Escrow.json'
import config from './config.json'

function App () {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)
  const [realEstate, setRealEstate] = useState(null)
  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false)

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    const chainId = network.chainId.toString()
    //console.log(chainId)

    const realEstate = new ethers.Contract(
      config[chainId].realEstate.target,
      realEstateABI,
      provider
    )

    console.log(
      'Attempting to create contract with address:',
      config[chainId].realEstate.target
    )
    let totalSupply
    try {
      totalSupply = await realEstate.totalSupply()
      console.log('Frontend totalSupply:', totalSupply.toString())
    } catch (err) {
      console.error('Error calling totalSupply:', err)
      return
    }

    const homes = []

    for (let i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i)
      const response = await fetch(uri)
      const metadata = await response.json()
      homes.push(metadata)
    }

    setHomes(homes)
    setRealEstate(realEstate)
    //console.log(homes)

    const escrow = new ethers.Contract(
      config[chainId].escrow.target,
      escrowABI,
      provider
    )
    setEscrow(escrow)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      const account = ethers.getAddress(accounts[0])
      setAccount(account)
    })
  }

  // Handles toggling the popup for a selected home
  function togglePop (home) {
    if (!home) return
    //console.log("Selected home:", home)
    setHome(home)
    toggle ? setToggle(false) : setToggle(true)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className='cards__section'>
        <h3>Homes for you</h3>
        <hr />
        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt={home.name} />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqmt
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toggle && (
        <Home
          home={home}
          provider={provider}
          account={account}
          escrow={escrow}
          realEstate={realEstate}
          togglePop={togglePop}
        />
      )}
    </div>
  )
}

export default App
