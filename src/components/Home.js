import { useState, useEffect } from 'react'
import close from '../assets/close.svg'

const Home = ({ home, provider, account, escrow, realEstate, togglePop }) => {
  const [buyer, setBuyer] = useState(null)
  const [seller, setSeller] = useState(null)
  const [valuator, setValuator] = useState(null)
  const [lender, setLender] = useState(null)
  const [owner, setOwner] = useState(null)

  const [hasBought, setHasBought] = useState(false)
  const [hasLended, setHasLended] = useState(false)
  const [hasValuated, setHasValuated] = useState(false)
  const [hasSold, setHasSold] = useState(false)

  const fetchDetails = async () => {
    if (!escrow) return
    const buyer = await escrow.buyer(home.id)
    const seller = await escrow.seller()
    const lender = await escrow.lender()
    const valuator = await escrow.valuator()
    setBuyer(buyer)
    setSeller(seller)
    setLender(lender)
    setValuator(valuator)

    // console.log('Seller is', seller)
    // console.log('Valuator is', valuator)
    // console.log('Lender is', lender)
    // console.log('Buyer is ', buyer)

    const hasBought = await escrow.approval(home.id, buyer)
    const hasValuated = await escrow.approval(home.id, valuator)
    const hasLended = await escrow.approval(home.id, lender)
    const hasSold = await escrow.approval(home.id, seller)

    setHasBought(hasBought)
    setHasValuated(hasValuated)
    setHasLended(hasLended)
    setHasSold(hasSold)
  }

  const fetchOwner = async () => {
    if (!realEstate || !escrow) return
    if (await escrow.isListed(home.id)) return
    const owner = await realEstate.ownerOf(home.id)
    setOwner(owner)
  }

  const buyHandler = async () => {
    const signer = await provider.getSigner()
    const depositAmount = await escrow.depositAmount(home.id)

    // Buyer pays the deposit money
    let transaction = await escrow
      .connect(signer)
      .payDeposit(home.id, { value: depositAmount })
    await transaction.wait()

    // Buyer approves sale
    transaction = await escrow.connect(signer).approveSale(home.id)
    await transaction.wait()

    setHasBought(true)
  }

  const valuateHandler = async () => {
    const signer = await provider.getSigner()

    // Valuator updates the valuation status of the property to true
    let transaction = await escrow
      .connect(signer)
      .updateValuationStatus(home.id, true)
    await transaction.wait()

    setHasValuated(true)
  }

  const lendHandler = async () => {
    const signer = await provider.getSigner()

    // Lender approves sale
    let transaction = await escrow.connect(signer).approveSale(home.id)
    await transaction.wait()

    const lendAmount =
      (await escrow.purchasePrice(home.id)) -
      (await escrow.depositAmount(home.id))
    console.log('Lending amount:', lendAmount.toString())

    // Send funds to escrow contract using the contract's receive function
    transaction = await signer.sendTransaction({
      to: escrow.target,
      value: lendAmount.toString(),
      gasLimit: 60000
    })
    await transaction.wait()

    setHasLended(true)
  }

  const sellHandler = async () => {
    const signer = await provider.getSigner()

    // Seller approves sale
    let transaction = await escrow.connect(signer).approveSale(home.id)
    await transaction.wait()

    // Seller finalize sale
    transaction = await escrow.connect(signer).finalizeSale(home.id)
    await transaction.wait()

    setHasSold(true)
  }

  useEffect(() => {
    fetchDetails()
    fetchOwner()
  }, [hasSold, account])

  const renderActionButton = () => {
    if (
      account &&
      valuator &&
      account.toLowerCase() === valuator.toLowerCase()
    ) {
      return (
        <button
          className='home__buy'
          onClick={valuateHandler}
          disabled={hasValuated}
        >
          Approve Valuation
        </button>
      )
    }
    if (account && lender && account.toLowerCase() === lender.toLowerCase()) {
      return (
        <button
          className='home__buy'
          onClick={lendHandler}
          disabled={hasLended}
        >
          Approve and Lend
        </button>
      )
    }
    if (account && seller && account.toLowerCase() === seller.toLowerCase()) {
      return (
        <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
          Approve and Sell
        </button>
      )
    }
    return (
      <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
        Buy
      </button>
    )
  }

  return (
    <div className='home'>
      <div className='home__details'>
        <div className='home__image'>
          <img src={home.image} alt={home.name} />
        </div>
        <div className='home__overview'>
          <h1>{home.name}</h1>
          <p>
            <strong>{home.attributes[2].value}</strong> bds |
            <strong>{home.attributes[3].value}</strong> ba |
            <strong>{home.attributes[4].value}</strong> sqmt
          </p>
          <p>{home.address}</p>
          <h2>{home.attributes[0].value} ETH</h2>

          {owner ? (
            <div className='home__owned'>
              Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
            </div>
          ) : (
            <div>
              {renderActionButton()}
              <button className='home__contact'>Contact Agent</button>
            </div>
          )}

          <hr />
          <h2>Overview</h2>
          <p>{home.description}</p>
          <hr />
          <h2>Facts and Features</h2>
          <ul>
            {home.attributes.map((attribute, index) => (
              <li key={index}>
                <strong>{attribute.trait_type}</strong> : {attribute.value}
                {index === 0 ? ' ETH' : ''}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={togglePop} className='home__close'>
          <img src={close} alt='close' />
        </button>
      </div>
    </div>
  )
}

export default Home
